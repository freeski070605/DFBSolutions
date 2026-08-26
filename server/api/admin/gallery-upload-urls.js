import { ObjectId } from "mongodb";
import { requireAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { createPhotoUploadUrls, GALLERY_RESERVATION_BATCH_LIMIT } from "../_lib/galleryPhotos.js";
import { json, parseBody } from "../_lib/http.js";

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { success: false, message: "Method not allowed." });
  }
  if (Object.keys(req.query || {}).length) return json(res, 400, { success: false, message: "Unsupported upload permission query." });
  const body = parseBody(req);
  if (!validBody(body, new Set(["eventId", "photoIds"]))) return json(res, 400, { success: false, message: "Submit valid upload URL details." });
  const eventId = objectId(body.eventId);
  const photoIds = Array.isArray(body.photoIds) ? body.photoIds.map(objectId) : [];
  if (!eventId || !photoIds.length || photoIds.length > GALLERY_RESERVATION_BATCH_LIMIT || photoIds.some((id) => !id)) {
    return json(res, 400, { success: false, message: `Provide 1-${GALLERY_RESERVATION_BATCH_LIMIT} valid reserved photo IDs.` });
  }
  if (new Set(photoIds.map(String)).size !== photoIds.length) return json(res, 400, { success: false, message: "Photo IDs must be unique." });
  const db = await getDb();
  const event = await db.collection("gallery_events").findOne({ _id: eventId }, { projection: { _id: 1 } });
  if (!event) return json(res, 404, { success: false, message: "Gallery event not found." });
  const photos = await db.collection("gallery_photos").find({ _id: { $in: photoIds }, eventId, status: { $in: ["pending", "failed"] } }).toArray();
  if (photos.length !== photoIds.length) return json(res, 409, { success: false, message: "One or more photos cannot be uploaded for this event." });
  const byId = new Map(photos.map((photo) => [String(photo._id), photo]));
  const uploads = await Promise.all(photoIds.map((id) => createPhotoUploadUrls(byId.get(String(id)))));
  return json(res, 200, { success: true, uploads });
}

function objectId(value) {
  return typeof value === "string" && /^[a-f0-9]{24}$/i.test(value) ? new ObjectId(value) : null;
}

function validBody(body, fields) {
  return body && typeof body === "object" && !Array.isArray(body) && Object.keys(body).every((key) => fields.has(key));
}
