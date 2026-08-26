import { ObjectId } from "mongodb";
import { requireAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { recordGalleryPhotoAudit, sanitizeGalleryPhotoForAdmin, verifyPhotoObjects } from "../_lib/galleryPhotos.js";
import { json, parseBody } from "../_lib/http.js";

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { success: false, message: "Method not allowed." });
  }
  if (Object.keys(req.query || {}).length) return json(res, 400, { success: false, message: "Unsupported upload completion query." });
  const body = parseBody(req);
  const allowed = new Set(["eventId", "photoId", "width", "height"]);
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some((key) => !allowed.has(key))) {
    return json(res, 400, { success: false, message: "Submit valid completion details." });
  }
  const eventId = objectId(body.eventId);
  const photoId = objectId(body.photoId);
  const width = positiveDimension(body.width);
  const height = positiveDimension(body.height);
  if (!eventId || !photoId || !width || !height) return json(res, 400, { success: false, message: "Valid event, photo, width, and height values are required." });
  const db = await getDb();
  const photo = await db.collection("gallery_photos").findOne({ _id: photoId, eventId });
  if (!photo) return json(res, 404, { success: false, message: "Reserved photo not found for this event." });
  if (photo.status === "ready") {
    await ensurePhotoCounted(db, eventId, photoId, admin);
    return json(res, 200, { success: true, item: sanitizeGalleryPhotoForAdmin(photo), alreadyComplete: true });
  }
  try {
    await verifyPhotoObjects(photo);
  } catch {
    return json(res, 409, { success: false, message: "The R2 photo upload is incomplete. Retry the upload before verifying it." });
  }
  const now = new Date();
  const completed = await db.collection("gallery_photos").findOneAndUpdate(
    { _id: photoId, eventId, status: { $ne: "ready" } },
    { $set: { status: "ready", width, height, updatedAt: now }, $unset: { failureReason: "" } },
    { returnDocument: "after" },
  );
  if (!completed) {
    const current = await db.collection("gallery_photos").findOne({ _id: photoId, eventId });
    await ensurePhotoCounted(db, eventId, photoId, admin);
    return json(res, 200, { success: true, item: sanitizeGalleryPhotoForAdmin(current), alreadyComplete: true });
  }
  await ensurePhotoCounted(db, eventId, photoId, admin);
  await recordGalleryPhotoAudit(db, admin, "gallery_photo_completed", eventId, photoId);
  return json(res, 200, { success: true, item: sanitizeGalleryPhotoForAdmin(completed), alreadyComplete: false });
}

function objectId(value) {
  return typeof value === "string" && /^[a-f0-9]{24}$/i.test(value) ? new ObjectId(value) : null;
}

function positiveDimension(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 && number <= 100_000 ? number : null;
}

async function ensurePhotoCounted(db, eventId, photoId, admin) {
  await db.collection("gallery_events").updateOne({ _id: eventId }, [{
    $set: {
      photoCount: {
        $cond: [
          { $in: [photoId, { $ifNull: ["$readyPhotoIds", []] }] },
          { $ifNull: ["$photoCount", 0] },
          { $add: [{ $ifNull: ["$photoCount", 0] }, 1] },
        ],
      },
      readyPhotoIds: { $setUnion: [{ $ifNull: ["$readyPhotoIds", []] }, [photoId]] },
      updatedAt: new Date(),
      updatedBy: admin.email,
    },
  }]);
}
