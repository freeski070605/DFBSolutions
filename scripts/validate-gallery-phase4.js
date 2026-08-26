import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { ObjectId } from "mongodb";

try { process.loadEnvFile?.(".env"); } catch (error) { if (error?.code !== "ENOENT") throw error; }
for (const name of ["MONGODB_URI", "R2_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"]) {
  if (!process.env[name] && !(name === "MONGODB_URI" && process.env.mongo_uri)) throw new Error(`${name} is required for Phase 4 validation.`);
}
const runId = randomBytes(7).toString("hex");
process.env.AUTH_SECRET = `phase-4-admin-auth-secret-${runId}-long-enough`;
process.env.GALLERY_CODE_PEPPER = `phase-4-code-pepper-${runId}-long-enough`;
process.env.GALLERY_SESSION_SECRET = `phase-4-session-secret-${runId}-long-enough`;
process.env.NODE_ENV = "development";

const [{ default: photosAdmin }, { default: uploadUrls }, { default: uploadComplete }, { default: publicPhotos }, { default: download }] = await Promise.all([
  import("../server/api/admin/gallery-photos.js"),
  import("../server/api/admin/gallery-upload-urls.js"),
  import("../server/api/admin/gallery-upload-complete.js"),
  import("../server/api/gallery/photos.js"),
  import("../server/api/gallery/download.js"),
]);
const [{ createSession }, { createGallerySession }, { getDb }, r2] = await Promise.all([
  import("../server/api/_lib/auth.js"),
  import("../server/api/_lib/galleryAuth.js"),
  import("../server/api/_lib/db.js"),
  import("../server/api/_lib/r2.js"),
]);

const db = await getDb();
const eventIds = [new ObjectId(), new ObjectId()];
const photoIds = [];
const adminEmail = `phase4-${runId}@example.invalid`;
const adminToken = await createSession({ _id: new ObjectId(), email: adminEmail, name: "Phase 4 Test", role: "owner" });
const adminHeaders = { cookie: `dfb_admin_session=${adminToken}`, origin: "http://localhost:3000", host: "localhost:3000", "x-forwarded-host": "localhost:3000" };
const now = new Date();
let validationError;

try {
  await db.collection("gallery_events").insertMany(eventIds.map((id, index) => ({
    _id: id, codeHash: randomBytes(32).toString("hex"), codeHint: `••${index}`, title: `Phase 4 ${runId} ${index}`,
    eventDate: null, expiresAt: null, published: true, downloadsEnabled: true, coverPhotoId: null,
    photoCount: 0, nextPhotoSortOrder: 0, readyPhotoIds: [], accessVersion: 1, archivedAt: null, createdAt: now, updatedAt: now,
    createdBy: adminEmail, updatedBy: adminEmail,
  })));
  const galleryTokenA = await createGallerySession({ eventId: eventIds[0], accessVersion: 1 });
  const galleryTokenB = await createGallerySession({ eventId: eventIds[1], accessVersion: 1 });
  const galleryHeadersA = { cookie: `dfb_gallery_session=${galleryTokenA}`, origin: "http://localhost:3000", host: "localhost:3000", "x-forwarded-host": "localhost:3000" };
  const galleryHeadersB = { cookie: `dfb_gallery_session=${galleryTokenB}`, origin: "http://localhost:3000", host: "localhost:3000", "x-forwarded-host": "localhost:3000" };

  assert.equal((await invoke(photosAdmin, { method: "POST", body: {} })).statusCode, 401);
  assert.equal((await invoke(uploadUrls, { method: "POST", body: {} })).statusCode, 401);
  assert.equal((await invoke(photosAdmin, { method: "POST", headers: galleryHeadersA, body: {} })).statusCode, 401);
  assert.equal((await invoke(photosAdmin, { method: "POST", headers: { ...adminHeaders, origin: "https://evil.example" }, body: {} })).statusCode, 403);
  assert.equal((await invoke(publicPhotos, { method: "GET" })).statusCode, 401);
  assert.equal((await invoke(download, { method: "POST", body: { photoId: String(new ObjectId()) } })).statusCode, 401);

  const files = Array.from({ length: 21 }, (_, index) => ({
    clientId: `phase4_${runId}_${index}`,
    originalFilename: index === 0 ? "Client Name ANDREA80.jpg" : `IMG_${String(index).padStart(4, "0")}.${index % 3 === 1 ? "png" : index % 3 === 2 ? "webp" : "jpg"}`,
    mimeType: index % 3 === 1 ? "image/png" : index % 3 === 2 ? "image/webp" : "image/jpeg",
    originalBytes: 64 + index,
  }));
  const reserved = await adminCall(photosAdmin, "POST", {}, { eventId: String(eventIds[0]), files });
  assert.equal(reserved.statusCode, 201);
  assert.equal(reserved.body.items.length, 21);
  photoIds.push(...reserved.body.items.map((item) => new ObjectId(item.id)));
  const repeated = await adminCall(photosAdmin, "POST", {}, { eventId: String(eventIds[0]), files: files.slice(0, 2) });
  assert.deepEqual(repeated.body.items.map((item) => item.id), reserved.body.items.slice(0, 2).map((item) => item.id));

  const unsupported = await adminCall(photosAdmin, "POST", {}, { eventId: String(eventIds[0]), files: [{ ...files[0], clientId: `badtype_${runId}`, mimeType: "image/heic" }] });
  assert.equal(unsupported.statusCode, 400);
  const oversized = await adminCall(photosAdmin, "POST", {}, { eventId: String(eventIds[0]), files: [{ ...files[0], clientId: `bigfile_${runId}`, originalBytes: 100 * 1024 * 1024 + 1 }] });
  assert.equal(oversized.statusCode, 400);
  const arbitraryKey = await adminCall(photosAdmin, "POST", {}, { eventId: String(eventIds[0]), files: [{ ...files[0], clientId: `badkey_${runId}`, originalKey: "events/other/file.jpg" }] });
  assert.equal(arbitraryKey.statusCode, 400);

  const stored = await db.collection("gallery_photos").findOne({ _id: photoIds[0] });
  assert.equal(stored.originalKey, `events/${eventIds[0]}/original/${photoIds[0]}.jpg`);
  assert.equal(JSON.stringify(stored).includes("ANDREA80"), true);
  assert.equal(stored.originalKey.includes("ANDREA80"), false);
  assert.equal(stored.originalKey.includes("Client Name"), false);

  const incomplete = await adminCall(uploadComplete, "POST", {}, { eventId: String(eventIds[0]), photoId: String(photoIds[3]), width: 100, height: 80 });
  assert.equal(incomplete.statusCode, 409);

  const permissionResponse = await adminCall(uploadUrls, "POST", {}, { eventId: String(eventIds[0]), photoIds: photoIds.slice(0, 3).map(String) });
  assert.equal(permissionResponse.statusCode, 200);
  assert.equal(JSON.stringify(permissionResponse.body).includes(process.env.R2_SECRET_ACCESS_KEY), false);
  assert.equal((await adminCall(uploadUrls, "POST", {}, { eventId: String(eventIds[1]), photoIds: [String(photoIds[0])] })).statusCode, 409);
  const originals = [randomBytes(64), randomBytes(65), randomBytes(66)];
  for (let index = 0; index < 3; index += 1) {
    const permission = permissionResponse.body.uploads[index];
    await put(permission.urls.original, originals[index], permission.contentTypes.original);
    if (index === 0) { const unsigned = new URL(permission.urls.original); unsigned.search = ""; assert.equal((await fetch(unsigned)).ok, false); }
    await put(permission.urls.web, randomBytes(35 + index), "image/jpeg");
    await put(permission.urls.thumb, randomBytes(20 + index), "image/jpeg");
    const complete = await adminCall(uploadComplete, "POST", {}, { eventId: String(eventIds[0]), photoId: String(photoIds[index]), width: 1600 + index, height: 1000 + index });
    assert.equal(complete.statusCode, 200);
  }
  assert.equal((await db.collection("gallery_events").findOne({ _id: eventIds[0] })).photoCount, 3);
  const duplicateCompletion = await adminCall(uploadComplete, "POST", {}, { eventId: String(eventIds[0]), photoId: String(photoIds[0]), width: 1600, height: 1000 });
  assert.equal(duplicateCompletion.body.alreadyComplete, true);
  assert.equal((await db.collection("gallery_events").findOne({ _id: eventIds[0] })).photoCount, 3);

  await adminCall(photosAdmin, "POST", { action: "mark-failed" }, { eventId: String(eventIds[0]), photoId: String(photoIds[4]), message: "test retry" });
  const retryPermission = await adminCall(uploadUrls, "POST", {}, { eventId: String(eventIds[0]), photoIds: [String(photoIds[4])] });
  await put(retryPermission.body.uploads[0].urls.original, randomBytes(68), files[4].mimeType);
  await put(retryPermission.body.uploads[0].urls.web, randomBytes(31), "image/jpeg");
  await put(retryPermission.body.uploads[0].urls.thumb, randomBytes(19), "image/jpeg");
  assert.equal((await adminCall(uploadComplete, "POST", {}, { eventId: String(eventIds[0]), photoId: String(photoIds[4]), width: 1200, height: 900 })).statusCode, 200);
  assert.equal((await db.collection("gallery_events").findOne({ _id: eventIds[0] })).photoCount, 4);
  assert.equal((await adminCall(photosAdmin, "POST", { action: "mark-failed" }, { eventId: String(eventIds[0]), photoId: String(photoIds[5]), message: "test failed photo" })).statusCode, 200);

  const listedAdmin = await adminCall(photosAdmin, "GET", { eventId: String(eventIds[0]), page: "1", limit: "5" });
  assert.equal(listedAdmin.statusCode, 200);
  assert.equal(listedAdmin.body.items.filter((item) => item.status === "ready").length, 4);
  assert(listedAdmin.body.items.filter((item) => item.status === "ready").every((item) => item.thumbUrl?.startsWith("http")));

  const cover = await adminCall(photosAdmin, "POST", { action: "set-cover" }, { eventId: String(eventIds[0]), photoId: String(photoIds[0]) });
  assert.equal(cover.statusCode, 200);
  const invalidCover = await adminCall(photosAdmin, "POST", { action: "set-cover" }, { eventId: String(eventIds[0]), photoId: String(photoIds[5]) });
  assert.equal(invalidCover.statusCode, 409);
  const reordered = await adminCall(photosAdmin, "PUT", {}, { eventId: String(eventIds[0]), photos: [{ photoId: String(photoIds[1]), sortOrder: 0 }, { photoId: String(photoIds[0]), sortOrder: 1 }] });
  assert.equal(reordered.statusCode, 200);

  const listA = await invoke(publicPhotos, { method: "GET", query: { page: "1", limit: "2" }, headers: galleryHeadersA });
  assert.equal(listA.statusCode, 200);
  assert.equal(listA.body.total, 4);
  assert.equal(listA.body.items.length, 2);
  assert.equal(listA.body.items[0].id, String(photoIds[1]));
  assert.equal(Object.hasOwn(listA.body.items[0], "originalUrl"), false);
  assert(listA.body.coverUrl);
  assert.equal((await invoke(publicPhotos, { method: "GET", query: { eventId: String(eventIds[1]) }, headers: galleryHeadersA })).statusCode, 400);

  const photoB = { ...(await db.collection("gallery_photos").findOne({ _id: photoIds[2] })), _id: new ObjectId(), eventId: eventIds[1], clientUploadId: `eventb_${runId}`, status: "ready" };
  photoB.originalKey = `events/${eventIds[1]}/original/${photoB._id}.jpg`;
  photoB.webKey = `events/${eventIds[1]}/web/${photoB._id}.jpg`;
  photoB.thumbKey = `events/${eventIds[1]}/thumb/${photoB._id}.jpg`;
  await db.collection("gallery_photos").insertOne(photoB); photoIds.push(photoB._id);
  await db.collection("gallery_events").updateOne({ _id: eventIds[1] }, { $set: { photoCount: 1 } });
  assert.equal((await invoke(publicPhotos, { method: "GET", query: {}, headers: galleryHeadersB })).body.total, 1);
  assert.equal((await invoke(download, { method: "POST", body: { photoId: String(photoB._id) }, headers: galleryHeadersA })).statusCode, 404);

  await db.collection("gallery_events").updateOne({ _id: eventIds[0] }, { $set: { downloadsEnabled: false } });
  assert.equal((await invoke(download, { method: "POST", body: { photoId: String(photoIds[0]) }, headers: galleryHeadersA })).statusCode, 403);
  await db.collection("gallery_events").updateOne({ _id: eventIds[0] }, { $set: { downloadsEnabled: true } });
  const downloadable = await invoke(download, { method: "POST", body: { photoId: String(photoIds[0]) }, headers: galleryHeadersA });
  assert.equal(downloadable.statusCode, 200);
  assert.deepEqual(Buffer.from(await (await fetch(downloadable.body.url)).arrayBuffer()), originals[0]);

  const rejectedDeleteKey = await adminCall(photosAdmin, "DELETE", { eventId: String(eventIds[0]), photoId: String(photoIds[0]), key: stored.originalKey });
  assert.equal(rejectedDeleteKey.statusCode, 400);
  const deleted = await adminCall(photosAdmin, "DELETE", { eventId: String(eventIds[0]), photoId: String(photoIds[0]) });
  assert.equal(deleted.statusCode, 200);
  const updatedEvent = await db.collection("gallery_events").findOne({ _id: eventIds[0] });
  assert.equal(updatedEvent.photoCount, 3);
  assert.equal(updatedEvent.coverPhotoId, null);
  assert.equal(await db.collection("gallery_photos").findOne({ _id: photoIds[0] }), null);

  const frontendSources = (await Promise.all([
    "src/components/admin/AdminGalleryPhotos.jsx", "src/components/gallery/EventGallery.jsx",
    "src/utils/galleryApi.js", "src/utils/galleryImageProcessing.js", "src/utils/galleryUpload.js",
  ].map((path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")))).join("\n");
  assert.match(frontendSources, /XMLHttpRequest/);
  assert.match(frontendSources, /loading="lazy"/);
  assert.match(frontendSources, /GALLERY_UPLOAD_CONCURRENCY = 3/);
  assert.doesNotMatch(frontendSources, /R2_ACCESS_KEY_ID|R2_SECRET_ACCESS_KEY|GALLERY_CODE_PEPPER|GALLERY_SESSION_SECRET/);
  assert.doesNotMatch(frontendSources, /localStorage|sessionStorage/);

  console.log("Gallery Phase 4 photo delivery validation passed.");
} catch (error) {
  validationError = error;
} finally {
  const remaining = await db.collection("gallery_photos").find({ eventId: { $in: eventIds } }).toArray();
  if (remaining.length) {
    await r2.getR2Client().send(new r2.DeleteObjectsCommand({ Bucket: r2.getR2BucketName(), Delete: { Objects: remaining.flatMap((photo) => [photo.originalKey, photo.webKey, photo.thumbKey].map((Key) => ({ Key }))) } })).catch(() => {});
  }
  await db.collection("gallery_photos").deleteMany({ eventId: { $in: eventIds } });
  await db.collection("gallery_events").deleteMany({ _id: { $in: eventIds } });
  await db.collection("audit_log").deleteMany({ adminEmail, resource: "gallery_photos" });
}

if (validationError) { console.error(validationError); process.exit(1); }
process.exit(0);

async function adminCall(handler, method, query, body) {
  return invoke(handler, { method, query, body, headers: adminHeaders });
}

async function put(url, bytes, contentType) {
  const response = await fetch(url, { method: "PUT", headers: { "Content-Type": contentType }, body: bytes });
  assert.equal(response.ok, true, `R2 PUT failed with ${response.status}`);
}

async function invoke(handler, { method, query = {}, body, headers = {} }) {
  const req = { method, query, body, headers, socket: { remoteAddress: "127.0.0.1" } };
  const res = { statusCode: 200, body: undefined, headers: {}, headersSent: false, status(code) { this.statusCode = code; return this; }, setHeader(name, value) { this.headers[name] = value; }, json(payload) { this.body = payload; this.headersSent = true; return this; } };
  await handler(req, res);
  return res;
}
