import { ObjectId } from "mongodb";
import { requireAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { createGalleryPhotoRecord } from "../_lib/galleryData.js";
import {
  createPhotoReadUrls,
  GALLERY_RESERVATION_BATCH_LIMIT,
  recordGalleryPhotoAudit,
  sanitizeGalleryPhotoForAdmin,
  validatePhotoReservationFile,
} from "../_lib/galleryPhotos.js";
import { cleanText, json, parseBody } from "../_lib/http.js";
import { DeleteObjectsCommand, getR2BucketName, getR2Client } from "../_lib/r2.js";

const PHOTO_STATUSES = new Set(["pending", "failed", "ready"]);

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  res.setHeader("Cache-Control", "private, no-store");
  const db = await getDb();
  if (req.method === "GET") {
    if (hasUnsupportedQuery(req, new Set(["eventId", "page", "limit", "status", "offset", "view"]))) return json(res, 400, { success: false, message: "Unsupported photo list query." });
    return listPhotos(req, res, db);
  }
  if (req.method === "POST") {
    if (hasUnsupportedQuery(req, new Set(["action"]))) return json(res, 400, { success: false, message: "Unsupported photo action query." });
    const action = cleanText(req.query?.action, 30);
    return action ? performAction(req, res, db, admin, action) : reservePhotos(req, res, db, admin);
  }
  if (req.method === "PUT") return reorderPhotos(req, res, db, admin);
  if (req.method === "DELETE") {
    if (hasUnsupportedQuery(req, new Set(["eventId", "photoId"]))) return json(res, 400, { success: false, message: "Unsupported photo deletion query." });
    return deletePhoto(req, res, db, admin);
  }
  res.setHeader("Allow", "GET, POST, PUT, DELETE");
  return json(res, 405, { success: false, message: "Method not allowed." });
}

async function listPhotos(req, res, db) {
  const eventId = objectId(req.query?.eventId);
  if (!eventId) return json(res, 400, { success: false, message: "A valid gallery event ID is required." });
  const event = await db.collection("gallery_events").findOne({ _id: eventId }, { projection: { _id: 1, coverPhotoId: 1 } });
  if (!event) return json(res, 404, { success: false, message: "Gallery event not found." });
  const page = Math.max(1, Number(req.query?.page) || 1);
  const limit = Math.min(60, Math.max(1, Number(req.query?.limit) || 40));
  const status = cleanText(req.query?.status, 20);
  const offset = req.query?.offset == null ? (page - 1) * limit : Number(req.query.offset);
  if (!Number.isSafeInteger(offset) || offset < 0) return json(res, 400, { success: false, message: "Invalid photo offset." });
  if (status && !PHOTO_STATUSES.has(status)) return json(res, 400, { success: false, message: "Photo status filter is invalid." });
  const query = { eventId, ...(status ? { status } : {}) };
  const collection = db.collection("gallery_photos");
  if (req.query?.view === "slideshow") {
    const featured = await collection.find({ eventId, status: "ready", featuredInSlideshow: true })
      .sort({ slideshowOrder: 1, sortOrder: 1, _id: 1 }).limit(30).toArray();
    const items = await Promise.all(featured.map(async (photo) => ({
      ...sanitizeGalleryPhotoForAdmin(photo, (await createPhotoReadUrls(photo, { includeWeb: false })).thumbUrl),
      isCover: String(event.coverPhotoId || "") === String(photo._id),
    })));
    return json(res, 200, { success: true, items });
  }
  if (req.query?.view) return json(res, 400, { success: false, message: "Unsupported photo view." });
  const [photos, total] = await Promise.all([
    collection.find(query).sort({ sortOrder: 1, createdAt: 1, _id: 1 }).skip(offset).limit(limit).toArray(),
    collection.countDocuments(query),
  ]);
  const items = await Promise.all(photos.map(async (photo) => {
    const thumbUrl = photo.status === "ready" ? (await createPhotoReadUrls(photo, { includeWeb: false })).thumbUrl : null;
    return { ...sanitizeGalleryPhotoForAdmin(photo, thumbUrl), isCover: String(event.coverPhotoId || "") === String(photo._id) };
  }));
  return json(res, 200, { success: true, items, total, page, pages: Math.ceil(total / limit), coverPhotoId: event.coverPhotoId ? String(event.coverPhotoId) : null });
}

async function reservePhotos(req, res, db, admin) {
  const body = parseBody(req);
  if (!validBody(body, new Set(["eventId", "files"]))) return json(res, 400, { success: false, message: "Submit valid photo reservation details." });
  const eventId = objectId(body.eventId);
  if (!eventId || !Array.isArray(body.files) || !body.files.length || body.files.length > GALLERY_RESERVATION_BATCH_LIMIT) {
    return json(res, 400, { success: false, message: `Reserve between 1 and ${GALLERY_RESERVATION_BATCH_LIMIT} photos at a time.` });
  }
  let files;
  try { files = body.files.map(validatePhotoReservationFile); }
  catch (error) { return json(res, 400, { success: false, message: error.message }); }
  if (new Set(files.map((file) => file.clientId)).size !== files.length) return json(res, 400, { success: false, message: "Photo upload identifiers must be unique." });
  const collection = db.collection("gallery_photos");
  const existing = await collection.find({ eventId, clientUploadId: { $in: files.map((file) => file.clientId) } }).toArray();
  const existingByClientId = new Map(existing.map((photo) => [photo.clientUploadId, photo]));
  const newFiles = files.filter((file) => !existingByClientId.has(file.clientId));
  let nextSortOrder = 0;
  if (newFiles.length) {
    const event = await db.collection("gallery_events").findOneAndUpdate(
      { _id: eventId },
      { $inc: { nextPhotoSortOrder: newFiles.length }, $set: { updatedAt: new Date(), updatedBy: admin.email } },
      { returnDocument: "after" },
    );
    if (!event) return json(res, 404, { success: false, message: "Gallery event not found." });
    nextSortOrder = Number(event.nextPhotoSortOrder) - newFiles.length;
    const records = newFiles.map((file, index) => ({
      ...createGalleryPhotoRecord({
        eventId,
        photoId: new ObjectId(),
        originalExtension: file.originalExtension,
        mimeType: file.mimeType,
        originalFilename: file.originalFilename,
        originalBytes: file.originalBytes,
        sortOrder: nextSortOrder + index,
      }),
      clientUploadId: file.clientId,
      createdBy: admin.email,
    }));
    await collection.insertMany(records);
    for (const record of records) existingByClientId.set(record.clientUploadId, record);
    await recordGalleryPhotoAudit(db, admin, "gallery_photos_reserved", eventId);
  } else if (!await db.collection("gallery_events").findOne({ _id: eventId }, { projection: { _id: 1 } })) {
    return json(res, 404, { success: false, message: "Gallery event not found." });
  }
  const items = files.map((file) => sanitizeGalleryPhotoForAdmin(existingByClientId.get(file.clientId)));
  return json(res, 201, { success: true, items });
}

async function performAction(req, res, db, admin, action) {
  if (!new Set(["set-cover", "mark-failed", "set-slideshow-feature", "reorder-slideshow", "set-alt-text"]).has(action)) return json(res, 400, { success: false, message: "Unsupported photo action." });
  const body = parseBody(req);
  if (action === "reorder-slideshow") {
    if (!validBody(body, new Set(["eventId", "photoIds"])) || !Array.isArray(body.photoIds) || body.photoIds.length > 1000) return json(res, 400, { success: false, message: "Invalid slideshow order." });
    const eventId = objectId(body.eventId);
    const photoIds = body.photoIds.map(objectId);
    if (!eventId || photoIds.some((id) => !id) || new Set(photoIds.map(String)).size !== photoIds.length) return json(res, 400, { success: false, message: "Invalid slideshow photo IDs." });
    const collection = db.collection("gallery_photos");
    const count = await collection.countDocuments({ eventId, status: "ready", featuredInSlideshow: true, _id: { $in: photoIds } });
    if (count !== photoIds.length) return json(res, 409, { success: false, message: "Slideshow photos must be featured and ready." });
    if (photoIds.length) await collection.bulkWrite(photoIds.map((id, index) => ({ updateOne: { filter: { _id: id, eventId }, update: { $set: { slideshowOrder: index, updatedAt: new Date() } } } })));
    await recordGalleryPhotoAudit(db, admin, "gallery_slideshow_reordered", eventId);
    return json(res, 200, { success: true });
  }
  const allowed = action === "set-cover" ? new Set(["eventId", "photoId"]) : action === "set-slideshow-feature" ? new Set(["eventId", "photoId", "featured"]) : action === "set-alt-text" ? new Set(["eventId", "photoId", "altText"]) : new Set(["eventId", "photoId", "message"]);
  if (!validBody(body, allowed)) return json(res, 400, { success: false, message: "Submit valid photo action details." });
  const eventId = objectId(body.eventId);
  const photoId = objectId(body.photoId);
  if (!eventId || !photoId) return json(res, 400, { success: false, message: "Valid event and photo IDs are required." });
  if (action === "set-alt-text") {
    if (typeof body.altText !== "string" || body.altText.length > 240) return json(res, 400, { success: false, message: "Alt text must be 240 characters or fewer." });
    const altText = cleanText(body.altText, 240);
    const updated = await db.collection("gallery_photos").updateOne({ _id: photoId, eventId, status: "ready" }, { $set: { altText, updatedAt: new Date() } });
    if (!updated.matchedCount) return json(res, 409, { success: false, message: "Only ready photos can be described." });
    await recordGalleryPhotoAudit(db, admin, "gallery_photo_alt_text_changed", eventId, photoId);
    return json(res, 200, { success: true, altText });
  }
  if (action === "set-slideshow-feature") {
    if (typeof body.featured !== "boolean") return json(res, 400, { success: false, message: "Featured must be true or false." });
    const collection = db.collection("gallery_photos");
    const photo = await collection.findOne({ _id: photoId, eventId, status: "ready" });
    if (!photo) return json(res, 409, { success: false, message: "Only ready photos can be featured." });
    if (body.featured && !photo.featuredInSlideshow && await collection.countDocuments({ eventId, status: "ready", featuredInSlideshow: true }) >= 30) return json(res, 409, { success: false, message: "A slideshow can contain up to 30 featured photos." });
    const last = body.featured ? await collection.findOne({ eventId, featuredInSlideshow: true }, { sort: { slideshowOrder: -1 } }) : null;
    const slideshowOrder = body.featured ? (photo.featuredInSlideshow ? Number(photo.slideshowOrder) || 0 : (Number(last?.slideshowOrder) || 0) + 1) : 0;
    await collection.updateOne({ _id: photoId, eventId }, { $set: { featuredInSlideshow: body.featured, slideshowOrder, updatedAt: new Date() } });
    await recordGalleryPhotoAudit(db, admin, "gallery_slideshow_feature_changed", eventId, photoId);
    return json(res, 200, { success: true, featuredInSlideshow: body.featured, slideshowOrder });
  }
  if (action === "set-cover") {
    const photo = await db.collection("gallery_photos").findOne({ _id: photoId, eventId, status: "ready" }, { projection: { _id: 1 } });
    if (!photo) return json(res, 409, { success: false, message: "Only a ready photo from this event can be used as the cover." });
    const updated = await db.collection("gallery_events").updateOne({ _id: eventId }, { $set: { coverPhotoId: photoId, updatedAt: new Date(), updatedBy: admin.email } });
    if (!updated.matchedCount) return json(res, 404, { success: false, message: "Gallery event not found." });
    await recordGalleryPhotoAudit(db, admin, "gallery_cover_set", eventId, photoId);
    return json(res, 200, { success: true, coverPhotoId: String(photoId) });
  }
  const message = cleanText(body.message, 200) || "Upload did not complete.";
  const photo = await db.collection("gallery_photos").findOneAndUpdate(
    { _id: photoId, eventId, status: { $in: ["pending", "failed"] } },
    { $set: { status: "failed", failureReason: message, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!photo) return json(res, 409, { success: false, message: "Only an incomplete photo can be marked failed." });
  return json(res, 200, { success: true, item: sanitizeGalleryPhotoForAdmin(photo) });
}

async function reorderPhotos(req, res, db, admin) {
  const body = parseBody(req);
  if (!validBody(body, new Set(["eventId", "photos"]))) return json(res, 400, { success: false, message: "Submit a valid photo order." });
  const eventId = objectId(body.eventId);
  if (!eventId || !Array.isArray(body.photos) || !body.photos.length || body.photos.length > 1000) {
    return json(res, 400, { success: false, message: "Provide 1-1000 photos to reorder." });
  }
  if (body.photos.some((entry) => !validBody(entry, new Set(["photoId", "sortOrder"])))) return json(res, 400, { success: false, message: "Photo order contains unsupported fields." });
  const order = body.photos.map((entry) => ({ photoId: objectId(entry.photoId), sortOrder: Number(entry.sortOrder) }));
  if (order.some(({ photoId, sortOrder }) => !photoId || !Number.isSafeInteger(sortOrder) || sortOrder < 0 || sortOrder > 10_000_000)) {
    return json(res, 400, { success: false, message: "Photo order contains invalid values." });
  }
  if (new Set(order.map(({ photoId }) => String(photoId))).size !== order.length) return json(res, 400, { success: false, message: "Photos in an order must be unique." });
  const count = await db.collection("gallery_photos").countDocuments({ eventId, status: "ready", _id: { $in: order.map(({ photoId }) => photoId) } });
  if (count !== order.length) return json(res, 409, { success: false, message: "Every reordered photo must be ready and belong to this event." });
  const now = new Date();
  await db.collection("gallery_photos").bulkWrite(order.map(({ photoId, sortOrder }) => ({
    updateOne: { filter: { _id: photoId, eventId, status: "ready" }, update: { $set: { sortOrder, updatedAt: now } } },
  })));
  await db.collection("gallery_events").updateOne({ _id: eventId }, { $set: { updatedAt: now, updatedBy: admin.email } });
  await recordGalleryPhotoAudit(db, admin, "gallery_photos_reordered", eventId);
  return json(res, 200, { success: true });
}

async function deletePhoto(req, res, db, admin) {
  const eventId = objectId(req.query?.eventId);
  const photoId = objectId(req.query?.photoId);
  if (!eventId || !photoId) return json(res, 400, { success: false, message: "Valid event and photo IDs are required." });
  const photo = await db.collection("gallery_photos").findOne({ _id: photoId, eventId });
  if (!photo) return json(res, 404, { success: false, message: "Photo not found for this event." });
  let deletion;
  try {
    deletion = await getR2Client().send(new DeleteObjectsCommand({
      Bucket: getR2BucketName(),
      Delete: { Objects: [{ Key: photo.originalKey }, { Key: photo.webKey }, { Key: photo.thumbKey }], Quiet: true },
    }));
  } catch {
    return failDeletion(res, db, admin, eventId, photo, "Cloud storage could not be reached. The photo was kept for a safe retry.");
  }
  if (deletion.Errors?.length) return failDeletion(res, db, admin, eventId, photo, "Some stored photo files could not be removed. The photo was hidden and kept for cleanup.");
  await db.collection("gallery_photos").deleteOne({ _id: photoId, eventId });
  await updateEventAfterRemoval(db, admin, eventId, photo);
  await recordGalleryPhotoAudit(db, admin, "gallery_photo_deleted", eventId, photoId);
  return json(res, 200, { success: true });
}

async function failDeletion(res, db, admin, eventId, photo, message) {
  if (photo.status === "ready") {
    await db.collection("gallery_photos").updateOne({ _id: photo._id, eventId }, { $set: { status: "failed", failureReason: "Storage cleanup is incomplete.", updatedAt: new Date() } });
    await updateEventAfterRemoval(db, admin, eventId, photo);
  }
  return json(res, 502, { success: false, message });
}

async function updateEventAfterRemoval(db, admin, eventId, photo) {
  await db.collection("gallery_events").updateOne({ _id: eventId }, [{
    $set: {
      photoCount: {
        $cond: [
          { $in: [photo._id, { $ifNull: ["$readyPhotoIds", []] }] },
          { $max: [0, { $subtract: [{ $ifNull: ["$photoCount", 0] }, 1] }] },
          { $ifNull: ["$photoCount", 0] },
        ],
      },
      readyPhotoIds: { $setDifference: [{ $ifNull: ["$readyPhotoIds", []] }, [photo._id]] },
      coverPhotoId: { $cond: [{ $eq: ["$coverPhotoId", photo._id] }, null, "$coverPhotoId"] },
      updatedAt: new Date(),
      updatedBy: admin.email,
    },
  }]);
}

function objectId(value) {
  return typeof value === "string" && /^[a-f0-9]{24}$/i.test(value) ? new ObjectId(value) : null;
}

function validBody(body, fields) {
  return body && typeof body === "object" && !Array.isArray(body) && Object.keys(body).every((key) => fields.has(key));
}

function hasUnsupportedQuery(req, fields) {
  return Object.keys(req.query || {}).some((key) => !fields.has(key));
}
