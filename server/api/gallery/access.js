import { getDb } from "../_lib/db.js";
import {
  checkGalleryCodeAttemptLimit,
  clearGalleryCodeFailures,
  recordGalleryCodeFailure,
} from "../_lib/galleryAttempts.js";
import { createGallerySession, setGallerySessionCookie } from "../_lib/galleryAuth.js";
import { hashGalleryCode } from "../_lib/galleryCodes.js";
import { sanitizeGalleryEventForClient } from "../_lib/galleryData.js";
import { allowedOrigin, json, parseBody } from "../_lib/http.js";

const INVALID_CODE_RESPONSE = Object.freeze({ success: false, error: "Invalid or unavailable event code." });

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { success: false, message: "Method not allowed." });
  }
  if (!allowedOrigin(req)) return json(res, 403, { success: false, message: "Request origin was rejected." });

  const db = await getDb();
  const attempt = await checkGalleryCodeAttemptLimit(req, db);
  if (attempt.blocked) {
    return json(res, 429, { success: false, error: "Too many attempts. Try again later." });
  }

  const body = parseBody(req);
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some((key) => key !== "code")) {
    await recordGalleryCodeFailure(attempt.identifierHash, db);
    return json(res, 401, INVALID_CODE_RESPONSE);
  }

  let codeHash;
  try {
    codeHash = hashGalleryCode(body.code);
  } catch {
    await recordGalleryCodeFailure(attempt.identifierHash, db);
    return json(res, 401, INVALID_CODE_RESPONSE);
  }

  const event = await db.collection("gallery_events").findOne(
    { codeHash },
    { projection: { codeHash: 0 } },
  );
  if (!isAvailable(event)) {
    await recordGalleryCodeFailure(attempt.identifierHash, db);
    return json(res, 401, INVALID_CODE_RESPONSE);
  }

  await clearGalleryCodeFailures(attempt.identifierHash, db);
  const token = await createGallerySession({ eventId: event._id, accessVersion: event.accessVersion });
  setGallerySessionCookie(res, token);
  return json(res, 200, { success: true, event: sanitizeGalleryEventForClient(event) });
}

function isAvailable(event) {
  if (!event || event.published !== true || event.archivedAt != null) return false;
  if (event.expiresAt == null) return true;
  const expiresAt = new Date(event.expiresAt);
  return !Number.isNaN(expiresAt.getTime()) && expiresAt > new Date();
}
