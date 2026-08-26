import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Config } from "./galleryConfig.js";

export { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand };

let client;
let bucketName;

export function getR2Client() {
  if (!client) {
    const config = getR2Config();
    bucketName = config.bucketName;
    client = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return client;
}

export function getR2BucketName() {
  if (!bucketName) getR2Client();
  return bucketName;
}

export async function createR2PresignedUrl(command, expiresIn = 300) {
  if (!Number.isInteger(expiresIn) || expiresIn < 1 || expiresIn > 3600) {
    throw new RangeError("R2 presigned URL lifetime must be between 1 and 3600 seconds.");
  }
  return getSignedUrl(getR2Client(), command, { expiresIn });
}

export function createGalleryObjectKeys(eventId, photoId, originalExtension) {
  const safeEventId = normalizeInternalId(eventId, "eventId");
  const safePhotoId = normalizeInternalId(photoId, "photoId");
  const safeExtension = normalizeOriginalExtension(originalExtension);
  const prefix = `events/${safeEventId}`;
  return Object.freeze({
    originalKey: `${prefix}/original/${safePhotoId}.${safeExtension}`,
    webKey: `${prefix}/web/${safePhotoId}.jpg`,
    thumbKey: `${prefix}/thumb/${safePhotoId}.jpg`,
  });
}

export function createGalleryVideoObjectKey(eventId, videoId) {
  const safeEventId = normalizeInternalId(eventId, "eventId");
  const safeVideoId = normalizeInternalId(videoId, "videoId");
  return `events/${safeEventId}/video/${safeVideoId}.mp4`;
}

export function normalizeOriginalExtension(value) {
  if (typeof value !== "string") throw new TypeError("Original extension must be a string.");
  const extension = value.trim().toLowerCase().replace(/^\./, "");
  if (!/^[a-z0-9]{1,10}$/.test(extension)) throw new Error("Original extension is invalid.");
  return extension;
}

function normalizeInternalId(value, label) {
  const id = typeof value?.toHexString === "function" ? value.toHexString() : String(value || "");
  if (!/^[a-f0-9]{24}$/i.test(id)) throw new Error(`${label} must be a valid internal MongoDB ID.`);
  return id.toLowerCase();
}
