import { ObjectId } from "mongodb";
import { requireAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { createPhotoReadUrls } from "../_lib/galleryPhotos.js";
import {
  createGalleryVideoRecord,
  createVideoPlaybackUrl,
  createVideoUploadUrl,
  deleteVideoObject,
  recordGalleryVideoAudit,
  sanitizeGalleryVideo,
  validateVideoReservation,
  verifyVideoObject,
} from "../_lib/galleryVideos.js";
import { cleanText, json, parseBody } from "../_lib/http.js";

const ACTIONS = new Set(["reserve", "upload-url", "complete", "mark-failed"]);

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  res.setHeader("Cache-Control", "private, no-store");
  const db = await getDb();

  if (req.method === "GET") {
    if (unsupportedQuery(req, new Set(["eventId"]))) return json(res, 400, { success: false, message: "Unsupported event video query." });
    return getVideo(req, res, db);
  }
  if (req.method === "POST") {
    if (unsupportedQuery(req, new Set(["action"]))) return json(res, 400, { success: false, message: "Unsupported event video action query." });
    const action = cleanText(req.query?.action, 30);
    if (!ACTIONS.has(action)) return json(res, 400, { success: false, message: "A valid event video action is required." });
    if (action === "reserve") return reserveVideo(req, res, db, admin);
    if (action === "upload-url") return uploadUrl(req, res, db);
    if (action === "complete") return completeVideo(req, res, db, admin);
    return markFailed(req, res, db, admin);
  }
  if (req.method === "DELETE") {
    if (unsupportedQuery(req, new Set(["eventId", "videoId"]))) return json(res, 400, { success: false, message: "Unsupported event video deletion query." });
    return removeVideo(req, res, db, admin);
  }
  res.setHeader("Allow", "GET, POST, DELETE");
  return json(res, 405, { success: false, message: "Method not allowed." });
}

async function getVideo(req, res, db) {
  const eventId = objectId(req.query?.eventId);
  if (!eventId) return json(res, 400, { success: false, message: "A valid gallery event ID is required." });
  const event = await db.collection("gallery_events").findOne({ _id: eventId }, { projection: { _id: 1, featuredVideoId: 1, coverPhotoId: 1 } });
  if (!event) return json(res, 404, { success: false, message: "Gallery event not found." });
  const [active, pending] = await Promise.all([
    event.featuredVideoId ? db.collection("gallery_videos").findOne({ _id: event.featuredVideoId, eventId, status: "ready" }) : null,
    db.collection("gallery_videos").findOne({ eventId, status: { $in: ["pending", "failed"] } }, { sort: { createdAt: -1 } }),
  ]);
  let item = null;
  if (active) {
    const [url, posterUrl] = await Promise.all([
      createVideoPlaybackUrl(active),
      event.coverPhotoId ? adminPosterUrl(db, eventId, event.coverPhotoId) : null,
    ]);
    item = sanitizeGalleryVideo(active, { url, posterUrl, isActive: true });
  }
  return json(res, 200, { success: true, item, pending: sanitizeGalleryVideo(pending) });
}

async function reserveVideo(req, res, db, admin) {
  const body = parseBody(req);
  let details;
  try { details = validateVideoReservation(body); }
  catch (error) { return json(res, 400, { success: false, message: error.message }); }
  const eventId = objectId(body.eventId);
  if (!eventId) return json(res, 400, { success: false, message: "A valid gallery event ID is required." });
  if (!await db.collection("gallery_events").findOne({ _id: eventId }, { projection: { _id: 1 } })) {
    return json(res, 404, { success: false, message: "Gallery event not found." });
  }
  if (await db.collection("gallery_videos").findOne({ eventId, status: "pending" }, { projection: { _id: 1 } })) {
    return json(res, 409, { success: false, message: "This event already has an unfinished video upload. Remove it before reserving another." });
  }
  const videoId = new ObjectId();
  const record = createGalleryVideoRecord({ eventId, videoId, ...details, actor: admin.email });
  try { await db.collection("gallery_videos").insertOne(record); }
  catch (error) {
    if (error?.code === 11000) return json(res, 409, { success: false, message: "This event already has an unfinished video upload." });
    throw error;
  }
  await recordGalleryVideoAudit(db, admin, "gallery_video_reserved", eventId, videoId);
  return json(res, 201, { success: true, item: sanitizeGalleryVideo(record) });
}

async function uploadUrl(req, res, db) {
  const body = exactBody(parseBody(req), new Set(["eventId", "videoId"]));
  if (!body) return json(res, 400, { success: false, message: "Submit valid video upload permission details." });
  const eventId = objectId(body.eventId);
  const videoId = objectId(body.videoId);
  if (!eventId || !videoId) return json(res, 400, { success: false, message: "Valid event and video IDs are required." });
  const video = await db.collection("gallery_videos").findOne({ _id: videoId, eventId, status: { $in: ["pending", "failed"] } });
  if (!video) return json(res, 409, { success: false, message: "This video cannot be uploaded for the selected event." });
  if (video.status === "failed") await db.collection("gallery_videos").updateOne({ _id: videoId, eventId }, { $set: { status: "pending", updatedAt: new Date() }, $unset: { failureReason: "" } });
  return json(res, 200, { success: true, upload: await createVideoUploadUrl(video) });
}

async function completeVideo(req, res, db, admin) {
  const body = exactBody(parseBody(req), new Set(["eventId", "videoId", "durationSeconds", "width", "height"]));
  if (!body) return json(res, 400, { success: false, message: "Submit valid video completion details." });
  const eventId = objectId(body.eventId);
  const videoId = objectId(body.videoId);
  const width = dimension(body.width);
  const height = dimension(body.height);
  const durationSeconds = duration(body.durationSeconds);
  if (!eventId || !videoId || !width || !height || !durationSeconds) return json(res, 400, { success: false, message: "Valid event, video, duration, width, and height values are required." });
  const video = await db.collection("gallery_videos").findOne({ _id: videoId, eventId });
  if (!video) return json(res, 404, { success: false, message: "Reserved event video not found." });
  const event = await db.collection("gallery_events").findOne({ _id: eventId }, { projection: { featuredVideoId: 1 } });
  if (!event) return json(res, 404, { success: false, message: "Gallery event not found." });
  if (video.status === "ready") {
    if (String(event.featuredVideoId || "") !== String(videoId)) return json(res, 409, { success: false, message: "This video is no longer the active event film." });
    return json(res, 200, { success: true, item: sanitizeGalleryVideo(video, { isActive: true }), alreadyComplete: true });
  }
  try { await verifyVideoObject(video); }
  catch { return json(res, 409, { success: false, message: "The R2 video upload is incomplete or does not match its reservation." }); }

  const now = new Date();
  const ready = await db.collection("gallery_videos").findOneAndUpdate(
    { _id: videoId, eventId, status: { $in: ["pending", "failed"] } },
    { $set: { status: "ready", durationSeconds, width, height, updatedAt: now }, $unset: { failureReason: "" } },
    { returnDocument: "after" },
  );
  if (!ready) {
    const [current, currentEvent] = await Promise.all([
      db.collection("gallery_videos").findOne({ _id: videoId, eventId }),
      db.collection("gallery_events").findOne({ _id: eventId }, { projection: { featuredVideoId: 1 } }),
    ]);
    if (current?.status === "ready" && String(currentEvent?.featuredVideoId || "") === String(videoId)) {
      return json(res, 200, { success: true, item: sanitizeGalleryVideo(current, { isActive: true }), alreadyComplete: true });
    }
    return json(res, 409, { success: false, message: "This video completion is already being processed." });
  }
  const previousEvent = await db.collection("gallery_events").findOneAndUpdate(
    { _id: eventId },
    { $set: { featuredVideoId: videoId, updatedAt: now, updatedBy: admin.email } },
    { returnDocument: "before", projection: { featuredVideoId: 1 } },
  );
  const previousId = previousEvent?.featuredVideoId;
  if (previousId && String(previousId) !== String(videoId)) {
    const previous = await db.collection("gallery_videos").findOne({ _id: previousId, eventId });
    if (previous) {
      try {
        await deleteVideoObject(previous);
        await db.collection("gallery_videos").deleteOne({ _id: previousId, eventId });
      } catch (error) {
        console.error("Superseded gallery video cleanup failed.", { eventId: String(eventId), videoId: String(previousId), message: error?.message });
      }
    }
  }
  await recordGalleryVideoAudit(db, admin, "gallery_video_completed", eventId, videoId);
  return json(res, 200, { success: true, item: sanitizeGalleryVideo(ready, { isActive: true }), alreadyComplete: false });
}

async function markFailed(req, res, db, admin) {
  const body = exactBody(parseBody(req), new Set(["eventId", "videoId", "message"]));
  if (!body) return json(res, 400, { success: false, message: "Submit valid failed-upload details." });
  const eventId = objectId(body.eventId);
  const videoId = objectId(body.videoId);
  if (!eventId || !videoId) return json(res, 400, { success: false, message: "Valid event and video IDs are required." });
  const updated = await db.collection("gallery_videos").findOneAndUpdate(
    { _id: videoId, eventId, status: { $ne: "ready" } },
    { $set: { status: "failed", failureReason: cleanText(body.message, 220) || "Upload interrupted.", updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!updated) return json(res, 404, { success: false, message: "Pending event video not found." });
  await recordGalleryVideoAudit(db, admin, "gallery_video_failed", eventId, videoId);
  return json(res, 200, { success: true, item: sanitizeGalleryVideo(updated) });
}

async function removeVideo(req, res, db, admin) {
  const eventId = objectId(req.query?.eventId);
  const videoId = objectId(req.query?.videoId);
  if (!eventId || !videoId) return json(res, 400, { success: false, message: "Valid event and video IDs are required." });
  const video = await db.collection("gallery_videos").findOne({ _id: videoId, eventId });
  if (!video) return json(res, 404, { success: false, message: "Event video not found." });
  await db.collection("gallery_events").updateOne({ _id: eventId, featuredVideoId: videoId }, { $unset: { featuredVideoId: "" }, $set: { updatedAt: new Date(), updatedBy: admin.email } });
  try { await deleteVideoObject(video); }
  catch {
    await db.collection("gallery_videos").updateOne({ _id: videoId, eventId }, { $set: { status: "failed", removalPending: true, updatedAt: new Date() } });
    return json(res, 502, { success: false, message: "The video was hidden, but private storage removal must be retried." });
  }
  await db.collection("gallery_videos").deleteOne({ _id: videoId, eventId });
  await recordGalleryVideoAudit(db, admin, "gallery_video_removed", eventId, videoId);
  return json(res, 200, { success: true });
}

async function adminPosterUrl(db, eventId, photoId) {
  const photo = await db.collection("gallery_photos").findOne({ _id: photoId, eventId, status: "ready" });
  return photo ? (await createPhotoReadUrls(photo, { includeThumb: false })).webUrl : null;
}

function exactBody(body, allowed) {
  return body && typeof body === "object" && !Array.isArray(body) && Object.keys(body).every((key) => allowed.has(key)) ? body : null;
}
function unsupportedQuery(req, allowed) { return Object.keys(req.query || {}).some((key) => !allowed.has(key)); }
function objectId(value) { return typeof value === "string" && /^[a-f0-9]{24}$/i.test(value) ? new ObjectId(value) : null; }
function dimension(value) { const number = Number(value); return Number.isSafeInteger(number) && number > 0 && number <= 100_000 ? number : null; }
function duration(value) { const number = Number(value); return Number.isFinite(number) && number > 0 && number <= 24 * 60 * 60 ? Math.round(number * 1000) / 1000 : null; }
