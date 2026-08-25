import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";

try { process.loadEnvFile?.(".env"); } catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
if (!process.env.MONGODB_URI && !process.env.mongo_uri) {
  throw new Error("MONGODB_URI is required for the temporary Phase 2 API validation.");
}

const runId = randomBytes(6).toString("hex").toUpperCase();
process.env.AUTH_SECRET = `phase-2-admin-auth-secret-${runId}-long-enough`;
process.env.GALLERY_CODE_PEPPER = `phase-2-gallery-code-pepper-${runId}-long-enough`;
process.env.GALLERY_SESSION_SECRET = `phase-2-gallery-session-secret-${runId}-long-enough`;

const [{ default: galleries }, { default: access }, { default: gallerySession }, { default: logout }] = await Promise.all([
  import("../server/api/admin/galleries.js"),
  import("../server/api/gallery/access.js"),
  import("../server/api/gallery/session.js"),
  import("../server/api/gallery/logout.js"),
]);
const { createSession } = await import("../server/api/_lib/auth.js");
const { getDb } = await import("../server/api/_lib/db.js");
const { hashGalleryAttemptIdentifier } = await import("../server/api/_lib/galleryAttempts.js");

const db = await getDb();
const eventIds = [];
const attemptIps = [];
const adminId = new ObjectId();
const adminEmail = `phase2-${runId.toLowerCase()}@example.invalid`;
const adminToken = await createSession({ _id: adminId, email: adminEmail, name: "Phase 2 Test", role: "owner" });
const adminHeaders = {
  cookie: `dfb_admin_session=${adminToken}`,
  origin: "http://localhost:3000",
  host: "localhost:3000",
  "x-forwarded-host": "localhost:3000",
};
const codeOne = `P2-${runId}`;
const codeTwo = `P2-${randomBytes(6).toString("hex").toUpperCase()}`;
const resetCode = `P2-${randomBytes(6).toString("hex").toUpperCase()}`;
let validationError;

try {
  const denied = await invoke(galleries, { method: "GET" });
  assert.equal(denied.statusCode, 401);

  const created = await adminCall("POST", {}, { title: `Phase 2 ${runId}`, eventCode: codeOne });
  assert.equal(created.statusCode, 201);
  assert.equal(created.body.eventCode, codeOne);
  assert.equal(created.body.item.published, false);
  assert.equal(created.body.item.downloadsEnabled, true);
  assert.equal(created.body.item.photoCount, 0);
  assert.equal(created.body.item.coverPhotoId, null);
  assert.equal(created.body.item.archivedAt, null);
  assert.equal(created.body.item.accessVersion, 1);
  assert.equal(Object.hasOwn(created.body.item, "codeHash"), false);
  const eventOneId = new ObjectId(created.body.item.id);
  eventIds.push(eventOneId);

  const stored = await db.collection("gallery_events").findOne({ _id: eventOneId });
  assert.match(stored.codeHash, /^[a-f0-9]{64}$/);
  assert.notEqual(stored.codeHint, codeOne);
  assert.equal(JSON.stringify(stored).includes(codeOne), false);
  assert.equal(Object.hasOwn(stored, "eventCode"), false);

  const duplicate = await adminCall("POST", {}, { title: "Duplicate", eventCode: codeOne });
  assert.equal(duplicate.statusCode, 409);

  const second = await adminCall("POST", {}, { title: `Phase 2 duplicate target ${runId}`, eventCode: codeTwo });
  assert.equal(second.statusCode, 201);
  const eventTwoId = new ObjectId(second.body.item.id);
  eventIds.push(eventTwoId);

  const generated = await adminCall("POST", {}, { title: `Phase 2 generated ${runId}`, generateCode: true });
  assert.equal(generated.statusCode, 201);
  assert.match(generated.body.eventCode, /^DFB-[A-HJ-NP-Z2-9]{7}$/);
  assert.notEqual(generated.body.item.codeHint, generated.body.eventCode);
  eventIds.push(new ObjectId(generated.body.item.id));

  const duplicateReset = await adminCall("POST", { id: String(eventOneId), action: "reset-code" }, { eventCode: codeTwo });
  assert.equal(duplicateReset.statusCode, 409);

  const listed = await adminCall("GET", { page: "1", limit: "20" });
  assert.equal(listed.statusCode, 200);
  assert(listed.body.items.some((item) => item.id === String(eventOneId)));
  assert.equal(JSON.stringify(listed.body).includes("codeHash"), false);
  assert.equal(JSON.stringify(listed.body).includes(codeOne), false);

  const detailed = await adminCall("GET", { id: String(eventOneId) });
  assert.equal(detailed.statusCode, 200);
  assert.equal(detailed.body.item.id, String(eventOneId));
  assert.equal(Object.hasOwn(detailed.body.item, "codeHash"), false);
  const protectedUpdate = await adminCall("PUT", { id: String(eventOneId) }, { codeHash: "not-allowed", accessVersion: 99 });
  assert.equal(protectedUpdate.statusCode, 400);

  const published = await adminCall("POST", { id: String(eventOneId), action: "publish" }, {});
  assert.equal(published.statusCode, 200);
  assert.equal(published.body.item.published, true);

  const successfulAccess = await publicAccess(codeOne, uniqueIp("10"));
  assert.equal(successfulAccess.statusCode, 200);
  assert.equal(successfulAccess.body.event.id, String(eventOneId));
  assert.equal(Object.hasOwn(successfulAccess.body.event, "accessVersion"), false);
  assert.equal(Object.hasOwn(successfulAccess.body.event, "codeHint"), false);
  const firstGalleryCookie = cookieValue(successfulAccess.headers["Set-Cookie"], "dfb_gallery_session");
  assert(firstGalleryCookie);

  const wrong = await publicAccess(`WRONG-${runId}`, uniqueIp("11"));
  assertGenericCodeFailure(wrong);

  const unpublished = await publicAccess(codeTwo, uniqueIp("12"));
  assertGenericCodeFailure(unpublished);
  assert.equal(unpublished.body.error, wrong.body.error);

  const archived = await adminCall("POST", { id: String(eventOneId), action: "archive" }, {});
  assert.equal(archived.statusCode, 200);
  assert.equal(archived.body.item.published, false);
  assert(archived.body.item.archivedAt);
  const archivedPublish = await adminCall("POST", { id: String(eventOneId), action: "publish" }, {});
  assert.equal(archivedPublish.statusCode, 409);
  const archivedAccess = await publicAccess(codeOne, uniqueIp("13"));
  assertGenericCodeFailure(archivedAccess);
  assert.equal(archivedAccess.body.error, wrong.body.error);
  const archivedSession = await sessionCall(firstGalleryCookie);
  assert.equal(archivedSession.statusCode, 403);
  assert.match(archivedSession.headers["Set-Cookie"], /Max-Age=0/);

  const unarchived = await adminCall("POST", { id: String(eventOneId), action: "unarchive" }, {});
  assert.equal(unarchived.statusCode, 200);
  assert.equal(unarchived.body.item.archivedAt, null);
  assert.equal(unarchived.body.item.published, false);
  await adminCall("POST", { id: String(eventOneId), action: "publish" }, {});

  const preExpirationAccess = await publicAccess(codeOne, uniqueIp("14"));
  assert.equal(preExpirationAccess.statusCode, 200);
  const preExpirationCookie = cookieValue(preExpirationAccess.headers["Set-Cookie"], "dfb_gallery_session");
  const expiredUpdate = await adminCall("PUT", { id: String(eventOneId) }, { expiresAt: new Date(Date.now() - 60_000).toISOString() });
  assert.equal(expiredUpdate.statusCode, 200);
  const expiredAccess = await publicAccess(codeOne, uniqueIp("15"));
  assertGenericCodeFailure(expiredAccess);
  assert.equal(expiredAccess.body.error, wrong.body.error);
  const expiredSession = await sessionCall(preExpirationCookie);
  assert.equal(expiredSession.statusCode, 403);

  await adminCall("PUT", { id: String(eventOneId) }, { expiresAt: new Date(Date.now() + 86_400_000).toISOString() });
  const beforeReset = await publicAccess(codeOne, uniqueIp("16"));
  assert.equal(beforeReset.statusCode, 200);
  const oldCookie = cookieValue(beforeReset.headers["Set-Cookie"], "dfb_gallery_session");
  const oldVersion = (await db.collection("gallery_events").findOne({ _id: eventOneId })).accessVersion;

  const reset = await adminCall("POST", { id: String(eventOneId), action: "reset-code" }, { eventCode: resetCode });
  assert.equal(reset.statusCode, 200);
  assert.equal(reset.body.eventCode, resetCode);
  assert.equal(reset.body.item.accessVersion, oldVersion + 1);
  const resetStored = await db.collection("gallery_events").findOne({ _id: eventOneId });
  assert.equal(JSON.stringify(resetStored).includes(resetCode), false);
  assert.equal(Object.hasOwn(resetStored, "eventCode"), false);

  const oldCodeAccess = await publicAccess(codeOne, uniqueIp("17"));
  assertGenericCodeFailure(oldCodeAccess);
  const newCodeAccess = await publicAccess(resetCode, uniqueIp("18"));
  assert.equal(newCodeAccess.statusCode, 200);
  const invalidatedSession = await sessionCall(oldCookie);
  assert.equal(invalidatedSession.statusCode, 403);

  const rateIp = uniqueIp("19");
  for (let failure = 0; failure < 8; failure += 1) {
    const response = await publicAccess(`BAD-${runId}`, rateIp);
    assert.equal(response.statusCode, 401);
  }
  const limited = await publicAccess(resetCode, rateIp);
  assert.equal(limited.statusCode, 429);

  const clearIp = uniqueIp("20");
  await publicAccess(`BAD-${runId}`, clearIp);
  await publicAccess(`BAD-${runId}`, clearIp);
  const clearHash = hashGalleryAttemptIdentifier(clearIp);
  assert.equal((await db.collection("gallery_code_attempts").findOne({ identifierHash: clearHash })).failures, 2);
  const clearingSuccess = await publicAccess(resetCode, clearIp);
  assert.equal(clearingSuccess.statusCode, 200);
  assert.equal(await db.collection("gallery_code_attempts").findOne({ identifierHash: clearHash }), null);

  const logoutResponse = await invoke(logout, {
    method: "POST",
    headers: { ...publicHeaders(uniqueIp("21")), cookie: `dfb_gallery_session=${cookieValue(newCodeAccess.headers["Set-Cookie"], "dfb_gallery_session")}` },
  });
  assert.equal(logoutResponse.statusCode, 200);
  assert.match(logoutResponse.headers["Set-Cookie"], /dfb_gallery_session=/);
  assert.match(logoutResponse.headers["Set-Cookie"], /Max-Age=0/);
  assert.doesNotMatch(logoutResponse.headers["Set-Cookie"], /dfb_admin_session/);

  const auditRows = await db.collection("audit_log")
    .find({ adminId: String(adminId), resource: "gallery_events" }, { projection: { action: 1 } })
    .toArray();
  const auditActions = auditRows.map((row) => row.action);
  for (const action of ["gallery_created", "gallery_published", "gallery_archived", "gallery_unarchived", "gallery_code_reset"]) {
    assert(auditActions.includes(action));
  }

  console.log("Gallery Phase 2 API validation passed.");
} catch (error) {
  validationError = error;
} finally {
  await db.collection("gallery_events").deleteMany({ createdBy: adminEmail });
  const attemptHashes = attemptIps.map(hashGalleryAttemptIdentifier);
  if (attemptHashes.length) await db.collection("gallery_code_attempts").deleteMany({ identifierHash: { $in: attemptHashes } });
  await db.collection("audit_log").deleteMany({ adminId: String(adminId), resource: "gallery_events" });
}

if (validationError) {
  console.error(validationError);
  process.exit(1);
}
process.exit(0);

async function adminCall(method, query = {}, body) {
  return invoke(galleries, { method, query, body, headers: adminHeaders });
}

async function publicAccess(code, ip) {
  return invoke(access, { method: "POST", body: { code }, headers: publicHeaders(ip), ip });
}

async function sessionCall(token) {
  return invoke(gallerySession, { method: "GET", headers: { cookie: `dfb_gallery_session=${token}` } });
}

function publicHeaders(ip) {
  return {
    origin: "http://localhost:3000",
    host: "localhost:3000",
    "x-forwarded-host": "localhost:3000",
    "x-vercel-forwarded-for": ip,
  };
}

function uniqueIp(suffix) {
  const ip = `198.51.100.${Number(suffix)}`;
  attemptIps.push(ip);
  return ip;
}

function assertGenericCodeFailure(response) {
  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.body, { success: false, error: "Invalid or unavailable event code." });
}

function cookieValue(header, name) {
  const first = String(header || "").split(";", 1)[0];
  return first.startsWith(`${name}=`) ? first.slice(name.length + 1) : "";
}

async function invoke(handler, { method, query = {}, body, headers = {}, ip = "127.0.0.1" }) {
  const req = { method, query, body, headers, socket: { remoteAddress: ip } };
  const res = createResponse();
  await handler(req, res);
  return res;
}

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    headers: {},
    headersSent: false,
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    json(payload) { this.body = payload; this.headersSent = true; return this; },
  };
}
