import assert from "node:assert/strict";
import { SignJWT } from "jose";
import { ObjectId } from "mongodb";

process.env.GALLERY_CODE_PEPPER = "gallery-code-test-pepper-that-is-longer-than-32-characters";
process.env.GALLERY_SESSION_SECRET = "gallery-session-test-secret-that-is-longer-than-32-characters";
process.env.R2_ACCOUNT_ID = "test-account-id";
process.env.R2_ACCESS_KEY_ID = "test-access-key";
process.env.R2_SECRET_ACCESS_KEY = "test-secret-key";
process.env.R2_BUCKET_NAME = "dfb-client-galleries";
process.env.R2_ENDPOINT = "https://test-account-id.r2.cloudflarestorage.com";

const { hashGalleryCode, normalizeGalleryCode, verifyGalleryCode } = await import("../server/api/_lib/galleryCodes.js");
const { createGalleryObjectKeys } = await import("../server/api/_lib/r2.js");
const { getR2Config } = await import("../server/api/_lib/galleryConfig.js");
const { hashGalleryAttemptIdentifier } = await import("../server/api/_lib/galleryAttempts.js");
const {
  createGallerySession,
  getGalleryEventAccessFailure,
  setGallerySessionCookie,
  verifyGallerySessionToken,
} = await import("../server/api/_lib/galleryAuth.js");
const { DATABASE_INDEXES, ensureIndexes } = await import("../server/api/_lib/db.js");

assert.equal(normalizeGalleryCode("andrea80"), "ANDREA80");
assert.equal(normalizeGalleryCode(" Andrea80 "), "ANDREA80");
assert.equal(normalizeGalleryCode("A N D R E A 8 0"), "ANDREA80");
assert.throws(() => normalizeGalleryCode("ANDREA/80"));
assert.throws(() => normalizeGalleryCode("ABC"));

const codeHash = hashGalleryCode("andrea80");
assert.equal(codeHash, hashGalleryCode(" A N D R E A 8 0 "));
assert.notEqual(codeHash, hashGalleryCode("ANDERSON26"));
assert.equal(verifyGalleryCode("Andrea80", codeHash), true);
assert.equal(verifyGalleryCode("Anderson26", codeHash), false);
const identifierHash = hashGalleryAttemptIdentifier("192.0.2.10");
assert.match(identifierHash, /^[a-f0-9]{64}$/);
assert.equal(identifierHash.includes("192.0.2.10"), false);

assert.equal(getR2Config().bucketName, "dfb-client-galleries");
const savedR2Secret = process.env.R2_SECRET_ACCESS_KEY;
delete process.env.R2_SECRET_ACCESS_KEY;
assert.throws(() => getR2Config(), /R2_SECRET_ACCESS_KEY is required/);
process.env.R2_SECRET_ACCESS_KEY = savedR2Secret;

const eventId = new ObjectId();
const photoId = new ObjectId();
const keys = createGalleryObjectKeys(eventId, photoId, ".JPEG");
assert.deepEqual(keys, {
  originalKey: `events/${eventId}/original/${photoId}.jpeg`,
  webKey: `events/${eventId}/web/${photoId}.jpg`,
  thumbKey: `events/${eventId}/thumb/${photoId}.jpg`,
});
for (const key of Object.values(keys)) {
  assert.equal(key.includes("ANDREA80"), false);
  assert.equal(key.includes("Client Name"), false);
  assert.equal(key.includes("original-file"), false);
}

const token = await createGallerySession({ eventId, accessVersion: 3 });
const session = await verifyGallerySessionToken(token);
assert.equal(session.eventId, String(eventId));
assert.equal(session.accessVersion, 3);
const tokenParts = token.split(".");
tokenParts[2] = `${tokenParts[2][0] === "a" ? "b" : "a"}${tokenParts[2].slice(1)}`;
assert.equal(await verifyGallerySessionToken(tokenParts.join(".")), null);
const responseHeaders = {};
setGallerySessionCookie({ setHeader: (name, value) => { responseHeaders[name] = value; } }, token);
assert.match(responseHeaders["Set-Cookie"], /Path=\/api\/gallery/);
assert.match(responseHeaders["Set-Cookie"], /HttpOnly/);
assert.match(responseHeaders["Set-Cookie"], /SameSite=Lax/);
assert.doesNotMatch(responseHeaders["Set-Cookie"], /dfb_admin_session/);

const expiredToken = await new SignJWT({ eventId: String(eventId), accessVersion: 3 })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt(Math.floor(Date.now() / 1000) - 120)
  .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
  .sign(new TextEncoder().encode(process.env.GALLERY_SESSION_SECRET));
assert.equal(await verifyGallerySessionToken(expiredToken), null);

const now = new Date("2026-08-25T12:00:00.000Z");
const validEvent = {
  _id: eventId,
  accessVersion: 3,
  published: true,
  archivedAt: null,
  expiresAt: new Date("2026-08-26T12:00:00.000Z"),
};
assert.equal(getGalleryEventAccessFailure(session, validEvent, { now }), null);
assert.equal(getGalleryEventAccessFailure(session, { ...validEvent, accessVersion: 4 }, { now }), "access-version");
assert.equal(getGalleryEventAccessFailure(session, { ...validEvent, published: false }, { now }), "unpublished");
assert.equal(getGalleryEventAccessFailure(session, { ...validEvent, archivedAt: now }, { now }), "archived");
assert.equal(getGalleryEventAccessFailure(session, { ...validEvent, expiresAt: now }, { now }), "expired");
assert.equal(getGalleryEventAccessFailure(session, validEvent, { requestedEventId: String(new ObjectId()), now }), "requested-event-mismatch");

const indexCalls = [];
const fakeDb = {
  collection(name) {
    return {
      async createIndex(indexKeys, options) {
        indexCalls.push({ name, indexKeys, options });
      },
    };
  },
};
await ensureIndexes(fakeDb);
await ensureIndexes(fakeDb);
assert.equal(indexCalls.length, DATABASE_INDEXES.length);
assert(indexCalls.some(({ name, indexKeys, options }) => name === "gallery_events" && indexKeys.codeHash === 1 && options?.unique));
assert(indexCalls.some(({ name, indexKeys, options }) => name === "gallery_code_attempts" && indexKeys.expiresAt === 1 && options?.expireAfterSeconds === 0));

console.log("Gallery foundation validation passed.");
