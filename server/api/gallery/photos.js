import { getDb } from "../_lib/db.js";
import { requireGalleryEventAccess } from "../_lib/galleryAuth.js";
import { sanitizeGalleryPhotoForClient } from "../_lib/galleryData.js";
import { createPhotoReadUrls } from "../_lib/galleryPhotos.js";
import { json } from "../_lib/http.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { success: false, message: "Method not allowed." });
  }
  const allowedQuery = new Set(["page", "limit"]);
  if (Object.keys(req.query || {}).some((key) => !allowedQuery.has(key))) return json(res, 400, { success: false, message: "Unsupported gallery photo query." });
  const event = await requireGalleryEventAccess(req, res, { clearInvalidCookie: true });
  if (!event) return;
  const page = Math.max(1, Number(req.query?.page) || 1);
  const limit = Math.min(60, Math.max(1, Number(req.query?.limit) || 40));
  const db = await getDb();
  const query = { eventId: event._id, status: "ready" };
  const collection = db.collection("gallery_photos");
  const [photos, total, coverPhoto] = await Promise.all([
    collection.find(query).sort({ sortOrder: 1, createdAt: 1, _id: 1 }).skip((page - 1) * limit).limit(limit).toArray(),
    collection.countDocuments(query),
    event.coverPhotoId ? collection.findOne({ _id: event.coverPhotoId, ...query }) : null,
  ]);
  const items = await Promise.all(photos.map(async (photo) => ({
    ...sanitizeGalleryPhotoForClient(photo),
    ...await createPhotoReadUrls(photo),
  })));
  const coverUrl = coverPhoto ? (await createPhotoReadUrls(coverPhoto, { includeThumb: false })).webUrl : null;
  return json(res, 200, {
    success: true,
    items,
    total,
    page,
    pages: Math.ceil(total / limit),
    hasMore: page * limit < total,
    coverUrl,
  });
}
