import { ObjectId } from "mongodb";
import { getDb } from "../_lib/db.js";
import { requireGalleryEventAccess } from "../_lib/galleryAuth.js";
import { GALLERY_DOWNLOAD_URL_TTL_SECONDS, safeDownloadFilename } from "../_lib/galleryPhotos.js";
import { allowedOrigin, json, parseBody } from "../_lib/http.js";
import { createR2PresignedUrl, GetObjectCommand, getR2BucketName } from "../_lib/r2.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { success: false, message: "Method not allowed." });
  }
  if (!allowedOrigin(req)) return json(res, 403, { success: false, message: "Request origin was rejected." });
  const body = parseBody(req);
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some((key) => key !== "photoId")) {
    return json(res, 400, { success: false, message: "Submit a valid photo download request." });
  }
  const photoId = typeof body.photoId === "string" && /^[a-f0-9]{24}$/i.test(body.photoId) ? new ObjectId(body.photoId) : null;
  if (!photoId) return json(res, 400, { success: false, message: "A valid photo ID is required." });
  const event = await requireGalleryEventAccess(req, res, { clearInvalidCookie: true });
  if (!event) return;
  if (event.downloadsEnabled !== true) return json(res, 403, { success: false, message: "Original downloads are not available for this gallery." });
  const db = await getDb();
  const photo = await db.collection("gallery_photos").findOne({ _id: photoId, eventId: event._id, status: "ready" });
  if (!photo) return json(res, 404, { success: false, message: "Photo is unavailable." });
  const filename = safeDownloadFilename(photo.originalFilename, photo._id, photo.originalExtension);
  const asciiFilename = filename.replace(/[^a-zA-Z0-9._ -]/g, "_");
  const url = await createR2PresignedUrl(new GetObjectCommand({
    Bucket: getR2BucketName(),
    Key: photo.originalKey,
    ResponseContentDisposition: `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
  }), GALLERY_DOWNLOAD_URL_TTL_SECONDS);
  return json(res, 200, { success: true, url, filename, expiresIn: GALLERY_DOWNLOAD_URL_TTL_SECONDS });
}
