import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { getGalleryCodePepper } from "./galleryConfig.js";

const MIN_CODE_LENGTH = 6;
const MAX_CODE_LENGTH = 32;
const CODE_PATTERN = /^[A-Z0-9-]+$/;
const HASH_PATTERN = /^[a-f0-9]{64}$/;
const GENERATED_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

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

export function createGalleryCodeHint(value) {
  const normalized = normalizeGalleryCode(value);
  return `${"•".repeat(normalized.length - 2)}${normalized.slice(-2)}`;
}

export function generateGalleryCode() {
  let randomPart = "";
  for (let index = 0; index < 7; index += 1) {
    randomPart += GENERATED_CODE_ALPHABET[randomInt(GENERATED_CODE_ALPHABET.length)];
  }
  return `DFB-${randomPart}`;
}
