import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, createGalleryVideoObjectKey, createR2PresignedUrl, getR2BucketName, getR2Client } from "./r2.js";
import { cleanOriginalFilename } from "./galleryPhotos.js";

export const GALLERY_VIDEO_MIME_TYPE = "video/mp4";
export const GALLERY_VIDEO_MAX_BYTES = 5 * 1024 * 1024 * 1024;
export const GALLERY_VIDEO_UPLOAD_TTL_SECONDS = 20 * 60;
export const GALLERY_VIDEO_PLAYBACK_TTL_SECONDS = 60 * 60;

export function validateVideoReservation(value) {
  const allowed = new Set(["eventId", "originalFilename", "mimeType", "originalBytes"]);
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some((key) => !allowed.has(key))) {
    throw new Error("Submit valid event video details.");
  }
  const originalFilename = cleanOriginalFilename(value.originalFilename);
  if (!originalFilename) throw new Error("An original video filename is required.");
  const mimeType = typeof value.mimeType === "string" ? value.mimeType.trim().toLowerCase() : "";
  if (mimeType !== GALLERY_VIDEO_MIME_TYPE) throw new Error("Only web-ready H.264 MP4 video files are supported.");
  const originalBytes = Number(value.originalBytes);
  if (!Number.isSafeInteger(originalBytes) || originalBytes < 1) throw new Error("Video file size is invalid.");
  if (originalBytes > GALLERY_VIDEO_MAX_BYTES) throw new Error("Event videos must be 5 GB or smaller.");
  return { originalFilename, mimeType, originalBytes };
}

export function createGalleryVideoRecord({ eventId, videoId, originalFilename, mimeType, originalBytes, actor, now = new Date() }) {
  return {
    _id: videoId,
    eventId,
    objectKey: createGalleryVideoObjectKey(eventId, videoId),
    originalFilename,
    mimeType,
    originalBytes,
    status: "pending",
    durationSeconds: null,
    width: null,
    height: null,
    createdAt: now,
    updatedAt: now,
    createdBy: actor,
  };
}

export function sanitizeGalleryVideo(video, extras = {}) {
  if (!video) return null;
  return {
    id: String(video._id),
    eventId: String(video.eventId),
    originalFilename: video.originalFilename,
    mimeType: video.mimeType,
    originalBytes: Number(video.originalBytes) || 0,
    status: video.status,
    durationSeconds: finitePositive(video.durationSeconds),
    width: positiveInteger(video.width),
    height: positiveInteger(video.height),
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
    removalPending: video.removalPending === true,
    ...extras,
  };
}

export function sanitizeGalleryVideoForClient(video, extras = {}) {
  if (!video) return null;
  return {
    id: String(video._id),
    originalFilename: video.originalFilename,
    durationSeconds: finitePositive(video.durationSeconds),
    width: positiveInteger(video.width),
    height: positiveInteger(video.height),
    ...extras,
  };
}

export async function createVideoUploadUrl(video) {
  const url = await createR2PresignedUrl(new PutObjectCommand({
    Bucket: getR2BucketName(), Key: video.objectKey, ContentType: GALLERY_VIDEO_MIME_TYPE,
  }), GALLERY_VIDEO_UPLOAD_TTL_SECONDS);
  return { videoId: String(video._id), url, contentType: GALLERY_VIDEO_MIME_TYPE, expiresIn: GALLERY_VIDEO_UPLOAD_TTL_SECONDS };
}

export async function createVideoPlaybackUrl(video) {
  return createR2PresignedUrl(new GetObjectCommand({
    Bucket: getR2BucketName(), Key: video.objectKey, ResponseContentType: GALLERY_VIDEO_MIME_TYPE,
  }), GALLERY_VIDEO_PLAYBACK_TTL_SECONDS);
}

export async function verifyVideoObject(video) {
  const result = await getR2Client().send(new HeadObjectCommand({ Bucket: getR2BucketName(), Key: video.objectKey }));
  if (Number(result.ContentLength) !== Number(video.originalBytes)) throw new Error("The uploaded video size does not match its reservation.");
  if (String(result.ContentType || "").toLowerCase() !== GALLERY_VIDEO_MIME_TYPE) throw new Error("The uploaded video content type does not match its reservation.");
  return result;
}

export async function deleteVideoObject(video) {
  return getR2Client().send(new DeleteObjectCommand({ Bucket: getR2BucketName(), Key: video.objectKey }));
}

export async function recordGalleryVideoAudit(db, admin, action, eventId, videoId = null) {
  await db.collection("audit_log").insertOne({
    action, resource: "gallery_videos", resourceId: videoId, eventId,
    adminId: admin.id, adminEmail: admin.email, createdAt: new Date(),
  });
}

function positiveInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function finitePositive(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}
