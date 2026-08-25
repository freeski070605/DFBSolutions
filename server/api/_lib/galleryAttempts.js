import { createHmac } from "node:crypto";
import { getDb } from "./db.js";
import { getGalleryCodePepper } from "./galleryConfig.js";
import { getRequestIp } from "./http.js";

export const GALLERY_ATTEMPT_LIMIT = 8;
export const GALLERY_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

export function hashGalleryAttemptIdentifier(identifier) {
  if (typeof identifier !== "string" || !identifier.trim()) throw new TypeError("Attempt identifier is required.");
  return createHmac("sha256", getGalleryCodePepper())
    .update("dfb-gallery-attempt\0", "utf8")
    .update(identifier.trim(), "utf8")
    .digest("hex");
}

export async function checkGalleryCodeAttemptLimit(req, database) {
  const db = database || await getDb();
  const identifierHash = hashGalleryAttemptIdentifier(getRequestIp(req));
  const now = new Date();
  const record = await db.collection("gallery_code_attempts").findOne(
    { identifierHash, expiresAt: { $gt: now } },
    { projection: { failures: 1 } },
  );
  const failures = Number(record?.failures) || 0;
  return {
    blocked: failures >= GALLERY_ATTEMPT_LIMIT,
    failures,
    remaining: Math.max(0, GALLERY_ATTEMPT_LIMIT - failures),
    identifierHash,
  };
}

export async function recordGalleryCodeFailure(identifierHash, database) {
  assertIdentifierHash(identifierHash);
  const db = database || await getDb();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + GALLERY_ATTEMPT_WINDOW_MS);
  await db.collection("gallery_code_attempts").updateOne(
    { identifierHash },
    [
      {
        $set: {
          identifierHash,
          failures: {
            $cond: [
              { $gt: ["$expiresAt", now] },
              { $add: [{ $ifNull: ["$failures", 0] }, 1] },
              1,
            ],
          },
          createdAt: { $cond: [{ $gt: ["$expiresAt", now] }, "$createdAt", now] },
          expiresAt,
        },
      },
    ],
    { upsert: true },
  );
}

export async function clearGalleryCodeFailures(identifierHash, database) {
  assertIdentifierHash(identifierHash);
  const db = database || await getDb();
  await db.collection("gallery_code_attempts").deleteOne({ identifierHash });
}

function assertIdentifierHash(value) {
  if (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value)) {
    throw new TypeError("Attempt identifier hash is invalid.");
  }
}
