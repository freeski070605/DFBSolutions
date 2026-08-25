import { createHmac, timingSafeEqual } from "node:crypto";
import { getGalleryCodePepper } from "./galleryConfig.js";

const MIN_CODE_LENGTH = 6;
const MAX_CODE_LENGTH = 32;
const CODE_PATTERN = /^[A-Z0-9-]+$/;
const HASH_PATTERN = /^[a-f0-9]{64}$/;

export function normalizeGalleryCode(value) {
  if (typeof value !== "string") throw new TypeError("Gallery code must be a string.");
  const normalized = value.normalize("NFKC").trim().toUpperCase().replace(/\s+/gu, "");
  if (normalized.length < MIN_CODE_LENGTH || normalized.length > MAX_CODE_LENGTH) {
    throw new Error(`Gallery code must contain between ${MIN_CODE_LENGTH} and ${MAX_CODE_LENGTH} characters.`);
  }
  if (!CODE_PATTERN.test(normalized)) {
    throw new Error("Gallery code may contain only letters, numbers, and hyphens.");
  }
  return normalized;
}

export function hashGalleryCode(value) {
  const normalized = normalizeGalleryCode(value);
  return createHmac("sha256", getGalleryCodePepper()).update(normalized, "utf8").digest("hex");
}

export function verifyGalleryCode(value, expectedHash) {
  if (typeof expectedHash !== "string" || !HASH_PATTERN.test(expectedHash)) return false;
  let candidateHash;
  try {
    candidateHash = hashGalleryCode(value);
  } catch {
    return false;
  }
  return timingSafeEqual(Buffer.from(candidateHash, "hex"), Buffer.from(expectedHash, "hex"));
}
