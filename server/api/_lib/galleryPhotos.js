import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, createR2PresignedUrl, getR2BucketName, getR2Client } from "./r2.js";

export const GALLERY_SUPPORTED_IMAGE_TYPES = Object.freeze({
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
});
export const GALLERY_MAX_ORIGINAL_BYTES = 100 * 1024 * 1024;
export const GALLERY_RESERVATION_BATCH_LIMIT = 50;
export const GALLERY_UPLOAD_URL_TTL_SECONDS = 10 * 60;
export const GALLERY_PREVIEW_URL_TTL_SECONDS = 20 * 60;
export const GALLERY_DOWNLOAD_URL_TTL_SECONDS = 5 * 60;

export function validatePhotoReservationFile(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Each photo must be a valid file description.");
  const allowed = new Set(["clientId", "originalFilename", "mimeType", "originalBytes"]);
  if (Object.keys(value).some((key) => !allowed.has(key))) throw new Error("Photo reservation contains unsupported fields.");
  const clientId = typeof value.clientId === "string" ? value.clientId.trim() : "";
  if (!/^[a-zA-Z0-9_-]{8,80}$/.test(clientId)) throw new Error("Photo upload identifier is invalid.");
  const originalFilename = cleanOriginalFilename(value.originalFilename);
  if (!originalFilename) throw new Error("Original filename is required.");
  const mimeType = typeof value.mimeType === "string" ? value.mimeType.trim().toLowerCase() : "";
  const originalExtension = GALLERY_SUPPORTED_IMAGE_TYPES[mimeType];
  if (!originalExtension) throw new Error("Only JPEG, PNG, and WebP photos are supported.");
  const originalBytes = Number(value.originalBytes);
  if (!Number.isSafeInteger(originalBytes) || originalBytes < 1) throw new Error("Photo file size is invalid.");
  if (originalBytes > GALLERY_MAX_ORIGINAL_BYTES) throw new Error("Each original photo must be 100 MB or smaller.");
  return { clientId, originalFilename, mimeType, originalBytes, originalExtension };
}

export function sanitizeGalleryPhotoForAdmin(photo, thumbUrl = null) {
  return {
    id: String(photo._id),
    eventId: String(photo.eventId),
    originalFilename: photo.originalFilename,
    mimeType: photo.mimeType,
    originalBytes: Number(photo.originalBytes) || 0,
    width: photo.width ?? null,
    height: photo.height ?? null,
    sortOrder: Number(photo.sortOrder) || 0,
    status: photo.status,
    thumbUrl,
    createdAt: photo.createdAt,
    updatedAt: photo.updatedAt,
  };
}

export async function createPhotoUploadUrls(photo) {
  const bucket = getR2BucketName();
  const [originalUrl, webUrl, thumbUrl] = await Promise.all([
    createR2PresignedUrl(new PutObjectCommand({ Bucket: bucket, Key: photo.originalKey, ContentType: photo.mimeType }), GALLERY_UPLOAD_URL_TTL_SECONDS),
    createR2PresignedUrl(new PutObjectCommand({ Bucket: bucket, Key: photo.webKey, ContentType: "image/jpeg" }), GALLERY_UPLOAD_URL_TTL_SECONDS),
    createR2PresignedUrl(new PutObjectCommand({ Bucket: bucket, Key: photo.thumbKey, ContentType: "image/jpeg" }), GALLERY_UPLOAD_URL_TTL_SECONDS),
  ]);
  return {
    photoId: String(photo._id),
    urls: { original: originalUrl, web: webUrl, thumb: thumbUrl },
    contentTypes: { original: photo.mimeType, web: "image/jpeg", thumb: "image/jpeg" },
    expiresIn: GALLERY_UPLOAD_URL_TTL_SECONDS,
  };
}

export async function createPhotoReadUrls(photo, { includeWeb = true, includeThumb = true } = {}) {
  const bucket = getR2BucketName();
  const [webUrl, thumbUrl] = await Promise.all([
    includeWeb ? createR2PresignedUrl(new GetObjectCommand({ Bucket: bucket, Key: photo.webKey }), GALLERY_PREVIEW_URL_TTL_SECONDS) : null,
    includeThumb ? createR2PresignedUrl(new GetObjectCommand({ Bucket: bucket, Key: photo.thumbKey }), GALLERY_PREVIEW_URL_TTL_SECONDS) : null,
  ]);
  return { webUrl, thumbUrl };
}

export async function verifyPhotoObjects(photo) {
  const bucket = getR2BucketName();
  const [original, web, thumb] = await Promise.all([
    getR2Client().send(new HeadObjectCommand({ Bucket: bucket, Key: photo.originalKey })),
    getR2Client().send(new HeadObjectCommand({ Bucket: bucket, Key: photo.webKey })),
    getR2Client().send(new HeadObjectCommand({ Bucket: bucket, Key: photo.thumbKey })),
  ]);
  if (Number(original.ContentLength) !== Number(photo.originalBytes)) throw new Error("The original upload size does not match its reservation.");
  if (Number(web.ContentLength) < 1 || Number(thumb.ContentLength) < 1) throw new Error("One or more generated photo versions are empty.");
  return true;
}

export function safeDownloadFilename(value, photoId, extension) {
  const filename = cleanOriginalFilename(value).replace(/["\r\n]/g, "");
  if (filename) return filename;
  return `DFB-${String(photoId)}.${extension || "jpg"}`;
}

export function cleanOriginalFilename(value) {
  if (typeof value !== "string") return "";
  return value.replaceAll("\0", "").split(/[\\/]/).pop().trim().slice(0, 255);
}

export async function recordGalleryPhotoAudit(db, admin, action, eventId, photoId = null) {
  await db.collection("audit_log").insertOne({
    action,
    resource: "gallery_photos",
    resourceId: photoId,
    eventId,
    adminId: admin.id,
    adminEmail: admin.email,
    createdAt: new Date(),
  });
}
