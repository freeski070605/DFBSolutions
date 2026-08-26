import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ObjectId } from "mongodb";

try { process.loadEnvFile?.(".env"); } catch (error) { if (error?.code !== "ENOENT") throw error; }
for (const name of ["MONGODB_URI", "R2_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"]) {
  if (!process.env[name] && !(name === "MONGODB_URI" && process.env.mongo_uri)) throw new Error(`${name} is required for featured-video validation.`);
}
const runId = randomBytes(7).toString("hex");
process.env.AUTH_SECRET = `video-admin-auth-${runId}-long-enough-for-testing`;
process.env.GALLERY_CODE_PEPPER = `video-code-pepper-${runId}-long-enough-for-testing`;
process.env.GALLERY_SESSION_SECRET = `video-session-secret-${runId}-long-enough-for-testing`;
process.env.NODE_ENV = "development";

const [{ default: api }, { createSession }, { createGallerySession }, { getDb }, r2] = await Promise.all([
  import("../api/index.js"), import("../server/api/_lib/auth.js"), import("../server/api/_lib/galleryAuth.js"),
  import("../server/api/_lib/db.js"), import("../server/api/_lib/r2.js"),
]);
const db = await getDb();
const eventIds = [new ObjectId(), new ObjectId()];
const adminEmail = `video-${runId}@example.invalid`;
const adminToken = await createSession({ _id: new ObjectId(), email: adminEmail, name: "Video Test", role: "owner" });
const adminHeaders = headers(`dfb_admin_session=${adminToken}`);
const videoPath = join(tmpdir(), `dfb-gallery-${runId}.mp4`);
let error;

try {
  execFileSync("ffmpeg", ["-loglevel", "error", "-f", "lavfi", "-i", "color=c=black:s=640x360:r=24", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", "1", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart", "-shortest", "-y", videoPath]);
  const mp4 = await readFile(videoPath);
  const now = new Date();
  await db.collection("gallery_events").insertMany(eventIds.map((id, index) => ({
    _id: id, codeHash: randomBytes(32).toString("hex"), codeHint: `••${index}`, title: `Video ${runId} ${index}`,
    eventDate: null, expiresAt: null, published: true, downloadsEnabled: true, coverPhotoId: null, featuredVideoId: null,
    photoCount: 0, nextPhotoSortOrder: 0, readyPhotoIds: [], accessVersion: 1, archivedAt: null,
    createdAt: now, updatedAt: now, createdBy: adminEmail, updatedBy: adminEmail,
  })));
  const sessionA = await createGallerySession({ eventId: eventIds[0], accessVersion: 1 });
  const sessionB = await createGallerySession({ eventId: eventIds[1], accessVersion: 1 });
  const galleryA = headers(`dfb_gallery_session=${sessionA}`);
  const galleryB = headers(`dfb_gallery_session=${sessionB}`);
  const adminRoute = { route: "admin/gallery-video", path: "gallery-video" };
  const publicRoute = { route: "gallery/video", path: "video" };

  assert.equal((await invoke(api, { method: "POST", query: { ...adminRoute, action: "reserve" }, body: {} })).statusCode, 401);
  assert.equal((await invoke(api, { method: "GET", query: publicRoute })).statusCode, 401);
  assert.equal((await admin(api, "POST", { ...adminRoute, action: "reserve" }, { eventId: String(eventIds[0]), originalFilename: "film.mov", mimeType: "video/quicktime", originalBytes: mp4.length })).statusCode, 400);
  const mismatch = await admin(api, "POST", { ...adminRoute, action: "reserve" }, { eventId: String(eventIds[0]), originalFilename: "Mismatch.mp4", mimeType: "video/mp4", originalBytes: mp4.length + 1 });
  const mismatchPermission = await admin(api, "POST", { ...adminRoute, action: "upload-url" }, { eventId: String(eventIds[0]), videoId: mismatch.body.item.id });
  await put(mismatchPermission.body.upload.url, mp4);
  assert.equal((await admin(api, "POST", { ...adminRoute, action: "complete" }, { eventId: String(eventIds[0]), videoId: mismatch.body.item.id, durationSeconds: 1, width: 640, height: 360 })).statusCode, 409);
  assert.equal((await admin(api, "DELETE", { ...adminRoute, eventId: String(eventIds[0]), videoId: mismatch.body.item.id })).statusCode, 200);
  const first = await admin(api, "POST", { ...adminRoute, action: "reserve" }, { eventId: String(eventIds[0]), originalFilename: "Andrea 80th Recap.mp4", mimeType: "video/mp4", originalBytes: mp4.length });
  assert.equal(first.statusCode, 201);
  const firstId = first.body.item.id;
  const firstRecord = await db.collection("gallery_videos").findOne({ _id: new ObjectId(firstId) });
  assert.equal(firstRecord.objectKey, `events/${eventIds[0]}/video/${firstId}.mp4`);
  assert.equal(firstRecord.objectKey.includes("Andrea"), false);
  assert.equal(Object.hasOwn(first.body.item, "objectKey"), false);
  assert.equal((await admin(api, "POST", { ...adminRoute, action: "reserve" }, { eventId: String(eventIds[0]), originalFilename: "duplicate.mp4", mimeType: "video/mp4", originalBytes: mp4.length })).statusCode, 409);

  const firstPermission = await admin(api, "POST", { ...adminRoute, action: "upload-url" }, { eventId: String(eventIds[0]), videoId: firstId });
  assert.equal(firstPermission.statusCode, 200);
  assert.equal(JSON.stringify(firstPermission.body).includes(process.env.R2_SECRET_ACCESS_KEY), false);
  assert.equal(Object.hasOwn(firstPermission.body.upload, "objectKey"), false);
  assert.equal((await admin(api, "POST", { ...adminRoute, action: "upload-url" }, { eventId: String(eventIds[1]), videoId: firstId })).statusCode, 409);
  await put(firstPermission.body.upload.url, mp4, "https://www.dfbsolutions.co");
  const firstComplete = await admin(api, "POST", { ...adminRoute, action: "complete" }, { eventId: String(eventIds[0]), videoId: firstId, durationSeconds: 1, width: 640, height: 360 });
  assert.equal(firstComplete.statusCode, 200);
  assert.equal(String((await db.collection("gallery_events").findOne({ _id: eventIds[0] })).featuredVideoId), firstId);
  const publicFirst = await invoke(api, { method: "GET", query: publicRoute, headers: galleryA });
  assert.equal(publicFirst.statusCode, 200);
  assert.equal(publicFirst.body.video.id, firstId);
  assert.equal(Object.hasOwn(publicFirst.body.video, "objectKey"), false);
  assert.equal((await invoke(api, { method: "GET", query: publicRoute, headers: galleryB })).body.video, null);
  assert.equal((await invoke(api, { method: "GET", query: { ...publicRoute, eventId: String(eventIds[0]) }, headers: galleryB })).statusCode, 400);
  const ranged = await fetch(publicFirst.body.video.url, { headers: { Origin: "http://localhost:3000", Range: "bytes=0-63" } });
  assert.equal(ranged.status, 206);
  assert.equal(ranged.headers.get("access-control-allow-origin"), "http://localhost:3000");
  assert.match(ranged.headers.get("content-range") || "", /^bytes 0-63\//);
  assert.equal(ranged.headers.get("accept-ranges"), "bytes");
  assert.equal((await ranged.arrayBuffer()).byteLength, 64);
  const productionRange = await fetch(publicFirst.body.video.url, { headers: { Origin: "https://www.dfbsolutions.co", Range: "bytes=64-127" } });
  assert.equal(productionRange.status, 206);
  assert.equal(productionRange.headers.get("access-control-allow-origin"), "https://www.dfbsolutions.co");

  const second = await admin(api, "POST", { ...adminRoute, action: "reserve" }, { eventId: String(eventIds[0]), originalFilename: "Replacement.mp4", mimeType: "video/mp4", originalBytes: mp4.length });
  const secondId = second.body.item.id;
  assert.equal((await invoke(api, { method: "GET", query: publicRoute, headers: galleryA })).body.video.id, firstId);
  const secondPermission = await admin(api, "POST", { ...adminRoute, action: "upload-url" }, { eventId: String(eventIds[0]), videoId: secondId });
  await put(secondPermission.body.upload.url, mp4);
  assert.equal((await admin(api, "POST", { ...adminRoute, action: "complete" }, { eventId: String(eventIds[0]), videoId: secondId, durationSeconds: 1, width: 640, height: 360 })).statusCode, 200);
  assert.equal((await invoke(api, { method: "GET", query: publicRoute, headers: galleryA })).body.video.id, secondId);
  assert.equal(await db.collection("gallery_videos").findOne({ _id: new ObjectId(firstId) }), null);
  await assert.rejects(() => r2.getR2Client().send(new r2.HeadObjectCommand({ Bucket: r2.getR2BucketName(), Key: firstRecord.objectKey })));
  const idempotent = await admin(api, "POST", { ...adminRoute, action: "complete" }, { eventId: String(eventIds[0]), videoId: secondId, durationSeconds: 1, width: 640, height: 360 });
  assert.equal(idempotent.body.alreadyComplete, true);

  await db.collection("gallery_events").updateOne({ _id: eventIds[0] }, { $set: { published: false } });
  assert.equal((await invoke(api, { method: "GET", query: publicRoute, headers: galleryA })).statusCode, 403);
  await db.collection("gallery_events").updateOne({ _id: eventIds[0] }, { $set: { published: true, archivedAt: now } });
  assert.equal((await invoke(api, { method: "GET", query: publicRoute, headers: galleryA })).statusCode, 403);
  await db.collection("gallery_events").updateOne({ _id: eventIds[0] }, { $set: { archivedAt: null, expiresAt: new Date(Date.now() - 1000) } });
  assert.equal((await invoke(api, { method: "GET", query: publicRoute, headers: galleryA })).statusCode, 403);
  await db.collection("gallery_events").updateOne({ _id: eventIds[0] }, { $set: { expiresAt: null, accessVersion: 2 } });
  assert.equal((await invoke(api, { method: "GET", query: publicRoute, headers: galleryA })).statusCode, 403);
  const sessionA2 = await createGallerySession({ eventId: eventIds[0], accessVersion: 2 });
  const galleryA2 = headers(`dfb_gallery_session=${sessionA2}`);
  assert.equal((await invoke(api, { method: "GET", query: publicRoute, headers: galleryA2 })).body.video.id, secondId);

  assert.equal((await admin(api, "DELETE", { ...adminRoute, eventId: String(eventIds[0]), videoId: secondId })).statusCode, 200);
  assert.equal((await invoke(api, { method: "GET", query: publicRoute, headers: galleryA2 })).body.video, null);
  const secondRecordKey = `events/${eventIds[0]}/video/${secondId}.mp4`;
  await assert.rejects(() => r2.getR2Client().send(new r2.HeadObjectCommand({ Bucket: r2.getR2BucketName(), Key: secondRecordKey })));

  const [eventGallery, eventFilm, adminVideo, apiSource, uploadSource, styles] = await Promise.all([
    "src/components/gallery/EventGallery.jsx", "src/components/gallery/EventFilm.jsx", "src/components/admin/AdminGalleryVideo.jsx",
    "src/utils/galleryApi.js", "src/utils/galleryUpload.js", "src/index.css",
  ].map((path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")));
  assert(eventGallery.indexOf("<EventFilm") < eventGallery.indexOf("gallery-client-library"));
  assert.match(eventGallery, /!videoLoading && !video/);
  assert.match(eventFilm, /controls[\s\S]*playsInline[\s\S]*preload="metadata"/);
  assert.match(eventFilm, /object-fit|gallery-event-film-frame/);
  assert.match(styles, /gallery-event-film-frame[^{]*\{[^}]*aspect-ratio:\s*16\/9/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)/);
  assert.match(adminVideo, /H\.264 MP4/);
  assert.match(uploadSource, /XMLHttpRequest/);
  assert.doesNotMatch([eventGallery, eventFilm, adminVideo, apiSource, uploadSource].join("\n"), /R2_ACCESS_KEY_ID|R2_SECRET_ACCESS_KEY|GALLERY_CODE_PEPPER|GALLERY_SESSION_SECRET|localStorage|sessionStorage/);
  console.log("Gallery featured event video validation passed.");
} catch (caught) { error = caught; }
finally {
  const remaining = await db.collection("gallery_videos").find({ eventId: { $in: eventIds } }).toArray();
  for (const video of remaining) await r2.getR2Client().send(new r2.DeleteObjectCommand({ Bucket: r2.getR2BucketName(), Key: video.objectKey })).catch(() => {});
  await db.collection("gallery_videos").deleteMany({ eventId: { $in: eventIds } });
  await db.collection("gallery_events").deleteMany({ _id: { $in: eventIds } });
  await db.collection("audit_log").deleteMany({ adminEmail });
  await rm(videoPath, { force: true });
}
if (error) { console.error(error); process.exit(1); }
process.exit(0);

function headers(cookie) { return { cookie, origin: "http://localhost:3000", host: "localhost:3000", "x-forwarded-host": "localhost:3000" }; }
function admin(handler, method, query, body) { return invoke(handler, { method, query, body, headers: adminHeaders }); }
async function put(url, bytes, origin = "http://localhost:3000") { const response = await fetch(url, { method: "PUT", headers: { "Content-Type": "video/mp4", Origin: origin }, body: bytes }); assert.equal(response.ok, true, `R2 video PUT failed with ${response.status}`); assert.equal(response.headers.get("access-control-allow-origin"), origin); }
async function invoke(handler, { method, query = {}, body, headers = {} }) {
  const req = { method, query, body, headers, socket: { remoteAddress: "127.0.0.1" } };
  const res = { statusCode: 200, body: undefined, headers: {}, headersSent: false, status(code) { this.statusCode = code; return this; }, setHeader(name, value) { this.headers[name] = value; }, json(payload) { this.body = payload; this.headersSent = true; return this; } };
  await handler(req, res); return res;
}
