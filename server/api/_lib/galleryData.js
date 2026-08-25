import { ObjectId } from "mongodb";
import { createGalleryObjectKeys, normalizeOriginalExtension } from "./r2.js";

export const GALLERY_EVENT_DEFAULTS = Object.freeze({
  accessVersion: 1,
  published: false,
  downloadsEnabled: true,
  coverPhotoId: null,
  photoCount: 0,
  archivedAt: null,
});

export const GALLERY_PHOTO_STATUSES = Object.freeze(["pending", "ready", "failed"]);

export function createGalleryEventRecord(input, { actor, now = new Date() } = {}) {
  if (!/^[a-f0-9]{64}$/.test(input?.codeHash || "")) throw new Error("A valid gallery code hash is required.");
  const title = cleanRequiredText(input?.title, 200, "Gallery title");
  const eventDate = input?.eventDate == null || input.eventDate === "" ? null : validDate(input.eventDate, "Event date");
  const expiresAt = input?.expiresAt == null || input.expiresAt === "" ? null : validDate(input.expiresAt, "Expiration date");
  const createdAt = validDate(now, "Creation date");
  const createdBy = cleanRequiredText(actor, 200, "Creating administrator");

  return {
    ...GALLERY_EVENT_DEFAULTS,
    codeHash: input.codeHash,
    codeHint: cleanCodeHint(input.codeHint),
    title,
    eventDate,
    expiresAt,
    published: input.published ?? GALLERY_EVENT_DEFAULTS.published,
    downloadsEnabled: input.downloadsEnabled ?? GALLERY_EVENT_DEFAULTS.downloadsEnabled,
    createdAt,
    updatedAt: createdAt,
    createdBy,
    updatedBy: createdBy,
  };
}

export function createGalleryPhotoRecord(input, { now = new Date() } = {}) {
  const eventId = toObjectId(input?.eventId, "Event ID");
  const photoId = toObjectId(input?.photoId, "Photo ID");
  const originalExtension = normalizeOriginalExtension(input?.originalExtension);
  const keys = createGalleryObjectKeys(eventId, photoId, originalExtension);
  const timestamp = validDate(now, "Creation date");

  return {
    _id: photoId,
    eventId,
    ...keys,
    originalExtension,
    mimeType: cleanRequiredText(input?.mimeType, 100, "MIME type"),
    originalFilename: cleanFilename(input?.originalFilename),
    width: positiveIntegerOrNull(input?.width),
    height: positiveIntegerOrNull(input?.height),
    originalBytes: nonNegativeInteger(input?.originalBytes),
    sortOrder: nonNegativeInteger(input?.sortOrder),
    status: "pending",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function sanitizeGalleryEventForAdmin(event) {
  if (!event || typeof event !== "object") return null;
  return {
    id: String(event._id),
    title: event.title,
    eventDate: event.eventDate ?? null,
    expiresAt: event.expiresAt ?? null,
    published: event.published === true,
    archivedAt: event.archivedAt ?? null,
    downloadsEnabled: event.downloadsEnabled !== false,
    coverPhotoId: event.coverPhotoId ? String(event.coverPhotoId) : null,
    photoCount: Number(event.photoCount) || 0,
    codeHint: event.codeHint ?? null,
    accessVersion: Number(event.accessVersion) || 1,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

export function sanitizeGalleryEventForClient(event) {
  if (!event || typeof event !== "object") return null;
  return {
    id: String(event._id),
    title: event.title,
    eventDate: event.eventDate,
    expiresAt: event.expiresAt,
    downloadsEnabled: Boolean(event.downloadsEnabled),
    coverPhotoId: event.coverPhotoId ? String(event.coverPhotoId) : null,
    photoCount: Number(event.photoCount) || 0,
  };
}

export function sanitizeGalleryPhotoForClient(photo) {
  if (!photo || typeof photo !== "object") return null;
  return {
    id: String(photo._id),
    width: photo.width ?? null,
    height: photo.height ?? null,
    sortOrder: Number(photo.sortOrder) || 0,
  };
}

function toObjectId(value, label) {
  if (value instanceof ObjectId) return value;
  if (!ObjectId.isValid(value)) throw new Error(`${label} must be a valid MongoDB ID.`);
  return new ObjectId(value);
}

function validDate(value, label) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} is invalid.`);
  return date;
}

function cleanRequiredText(value, max, label) {
  const text = typeof value === "string" ? value.trim().slice(0, max) : "";
  if (!text) throw new Error(`${label} is required.`);
  return text;
}

function cleanFilename(value) {
  const filename = typeof value === "string" ? value.replaceAll("\0", "").split(/[\\/]/).pop().trim() : "";
  return filename.slice(0, 255);
}

function cleanCodeHint(value) {
  if (value == null) return null;
  const hint = typeof value === "string" ? value.trim() : "";
  if (!hint || hint.length > 32) throw new Error("Gallery code hint is invalid.");
  return hint;
}

function positiveIntegerOrNull(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function nonNegativeInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : 0;
}
