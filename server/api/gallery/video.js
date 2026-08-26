import { getDb } from "../_lib/db.js";
import { requireGalleryEventAccess } from "../_lib/galleryAuth.js";
import { createPhotoReadUrls } from "../_lib/galleryPhotos.js";
import { createVideoPlaybackUrl, sanitizeGalleryVideoForClient } from "../_lib/galleryVideos.js";
import { json } from "../_lib/http.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { success: false, message: "Method not allowed." });
  }
  if (Object.keys(req.query || {}).length) return json(res, 400, { success: false, message: "Unsupported event video query." });
  const event = await requireGalleryEventAccess(req, res, { clearInvalidCookie: true });
  if (!event) return;
  if (!event.featuredVideoId) return json(res, 200, { success: true, video: null });
  const db = await getDb();
  const video = await db.collection("gallery_videos").findOne({ _id: event.featuredVideoId, eventId: event._id, status: "ready" });
  if (!video) return json(res, 200, { success: true, video: null });
  const [url, posterUrl] = await Promise.all([
    createVideoPlaybackUrl(video),
    event.coverPhotoId ? poster(db, event._id, event.coverPhotoId) : null,
  ]);
  return json(res, 200, { success: true, video: sanitizeGalleryVideoForClient(video, { url, posterUrl, expiresIn: 60 * 60 }) });
}

async function poster(db, eventId, photoId) {
  const photo = await db.collection("gallery_photos").findOne({ _id: photoId, eventId, status: "ready" });
  return photo ? (await createPhotoReadUrls(photo, { includeThumb: false })).webUrl : null;
}
