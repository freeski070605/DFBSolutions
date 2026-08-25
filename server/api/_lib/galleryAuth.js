import { SignJWT, jwtVerify } from "jose";
import { ObjectId } from "mongodb";
import { getDb } from "./db.js";
import { getGallerySessionSecret } from "./galleryConfig.js";
import { json } from "./http.js";

export const GALLERY_SESSION_COOKIE = "dfb_gallery_session";
export const GALLERY_SESSION_MAX_AGE_SECONDS = 6 * 60 * 60;
const encoder = new TextEncoder();

export async function createGallerySession({ eventId, accessVersion }) {
  const safeEventId = normalizeEventId(eventId);
  const safeAccessVersion = normalizeAccessVersion(accessVersion);
  return new SignJWT({ eventId: safeEventId, accessVersion: safeAccessVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${GALLERY_SESSION_MAX_AGE_SECONDS}s`)
    .sign(sessionSecret());
}

export function setGallerySessionCookie(res, token) {
  const secure = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    `${GALLERY_SESSION_COOKIE}=${token}; Path=/api/gallery; HttpOnly; SameSite=Lax; Max-Age=${GALLERY_SESSION_MAX_AGE_SECONDS}${secure ? "; Secure" : ""}`,
  );
}

export function clearGallerySession(res) {
  const secure = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    `${GALLERY_SESSION_COOKIE}=; Path=/api/gallery; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`,
  );
}

export async function verifyGallerySessionToken(token) {
  if (typeof token !== "string" || !token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret(), { algorithms: ["HS256"] });
    return {
      eventId: normalizeEventId(payload.eventId),
      accessVersion: normalizeAccessVersion(payload.accessVersion),
      issuedAt: payload.iat,
      expiresAt: payload.exp,
    };
  } catch {
    return null;
  }
}

export async function readGallerySession(req) {
  return verifyGallerySessionToken(readCookie(req, GALLERY_SESSION_COOKIE));
}

export async function requireGalleryEventAccess(req, res, { requestedEventId, database } = {}) {
  const session = await readGallerySession(req);
  if (!session) {
    json(res, 401, { success: false, message: "Gallery access is required." });
    return null;
  }

  const db = database || await getDb();
  const event = await db.collection("gallery_events").findOne(
    { _id: new ObjectId(session.eventId) },
    { projection: { codeHash: 0 } },
  );
  const failure = getGalleryEventAccessFailure(session, event, { requestedEventId });
  if (failure) {
    json(res, 403, { success: false, message: "Gallery access is no longer available." });
    return null;
  }
  return event;
}

export function getGalleryEventAccessFailure(session, event, { requestedEventId, now = new Date() } = {}) {
  if (!session || !event) return "missing";
  if (String(event._id) !== session.eventId) return "event-mismatch";
  if (requestedEventId != null && String(requestedEventId) !== session.eventId) return "requested-event-mismatch";
  if (event.accessVersion !== session.accessVersion) return "access-version";
  if (event.published !== true) return "unpublished";
  if (event.archivedAt != null) return "archived";
  if (event.expiresAt != null) {
    const expiresAt = new Date(event.expiresAt);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= now) return "expired";
  }
  return null;
}

function sessionSecret() {
  return encoder.encode(getGallerySessionSecret());
}

function normalizeEventId(value) {
  const eventId = typeof value?.toHexString === "function" ? value.toHexString() : String(value || "");
  if (!ObjectId.isValid(eventId) || String(new ObjectId(eventId)) !== eventId.toLowerCase()) {
    throw new Error("Gallery session event ID is invalid.");
  }
  return eventId.toLowerCase();
}

function normalizeAccessVersion(value) {
  const accessVersion = Number(value);
  if (!Number.isSafeInteger(accessVersion) || accessVersion < 1) {
    throw new Error("Gallery session access version is invalid.");
  }
  return accessVersion;
}

function readCookie(req, name) {
  for (const part of String(req.headers?.cookie || "").split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) return part.slice(separator + 1).trim();
  }
  return "";
}
