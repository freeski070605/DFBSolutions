import { randomUUID } from "node:crypto";
import { ObjectId } from "mongodb";
import { requireAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { createR2PresignedUrl, getR2BucketName, getR2Client, HeadObjectCommand, PutObjectCommand, DeleteObjectCommand } from "../_lib/r2.js";
import { json, parseBody } from "../_lib/http.js";

const types = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
const maxSize = 10 * 1024 * 1024;
const mediaUrl = (id) => `/api/content/site-media?id=${id}`;
const safeId = (value) => /^[a-f0-9]{24}$/i.test(String(value || "")) ? new ObjectId(value) : null;

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  res.setHeader("Cache-Control", "private, no-store");
  const db = await getDb();
  const collection = db.collection("site_media");
  if (req.method === "GET") {
    const search = String(req.query?.search || "").slice(0, 80);
    const page = Math.max(1, Math.min(1000, Number(req.query?.page) || 1));
    const sort = req.query?.sort === "oldest" ? 1 : -1;
    const query = search ? { filename: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" }, status: "ready" } : { status: "ready" };
    const items = await collection.find(query, { projection: { objectKey: 0 } }).sort({ createdAt: sort }).skip((page - 1) * 24).limit(25).toArray();
    const site = await db.collection("site_content").findOne({ key: "global" });
    const content = JSON.stringify({ home: site?.home, about: site?.about, global: site?.global, draft: site?.draft });
    return json(res, 200, { success: true, items: items.slice(0, 24).map((item) => ({ ...item, url: mediaUrl(item._id), usageCount: content.split(mediaUrl(item._id)).length - 1 })), hasMore: items.length > 24 });
  }
  const body = parseBody(req);
  if (req.method === "POST" && body.action === "reserve") {
    if (!types[body.mimeType]) return json(res, 400, { success: false, message: "Use a JPG, PNG, WebP, or AVIF image." });
    if (!Number.isInteger(body.fileSize) || body.fileSize < 1 || body.fileSize > maxSize) return json(res, 400, { success: false, message: "Image must be 10 MB or smaller." });
    const filename = String(body.filename || "").slice(0, 180).trim();
    if (!filename) return json(res, 400, { success: false, message: "Choose an image file." });
    const id = new ObjectId();
    const objectKey = `site-media/${id}/${randomUUID()}.${types[body.mimeType]}`;
    const uploadUrl = await createR2PresignedUrl(new PutObjectCommand({ Bucket: getR2BucketName(), Key: objectKey, ContentType: body.mimeType }), 300);
    await collection.insertOne({ _id: id, objectKey, filename, mimeType: body.mimeType, fileSize: body.fileSize, width: Number(body.width) || null, height: Number(body.height) || null, altText: "", status: "pending", createdAt: new Date(), createdBy: admin.email });
    return json(res, 200, { success: true, id: String(id), uploadUrl });
  }
  if (req.method === "POST" && body.action === "complete") {
    const id = safeId(body.id);
    const item = id && await collection.findOne({ _id: id, status: "pending" });
    if (!item) return json(res, 404, { success: false, message: "Upload was not found." });
    try {
      const head = await getR2Client().send(new HeadObjectCommand({ Bucket: getR2BucketName(), Key: item.objectKey }));
      if (Number(head.ContentLength) !== item.fileSize) return json(res, 400, { success: false, message: "Uploaded file size did not match." });
    } catch { return json(res, 400, { success: false, message: "Upload did not finish. Try again." }); }
    await collection.updateOne({ _id: id }, { $set: { status: "ready", altText: String(body.altText || "").slice(0, 300) } });
    return json(res, 200, { success: true, item: { ...item, status: "ready", altText: String(body.altText || "").slice(0, 300), url: mediaUrl(id) } });
  }
  if (req.method === "PUT") {
    const id = safeId(body.id);
    if (!id) return json(res, 400, { success: false, message: "Choose an image." });
    const altText = String(body.altText || "").slice(0, 300);
    await collection.updateOne({ _id: id, status: "ready" }, { $set: { altText } });
    return json(res, 200, { success: true });
  }
  if (req.method === "DELETE") {
    const id = safeId(req.query?.id);
    const item = id && await collection.findOne({ _id: id, status: "ready" });
    if (!item) return json(res, 404, { success: false, message: "Image not found." });
    const site = await db.collection("site_content").findOne({ key: "global" });
    const used = JSON.stringify({ home: site?.home, about: site?.about, global: site?.global, draft: site?.draft }).includes(mediaUrl(id));
    if (used) return json(res, 409, { success: false, message: "This image is used in website content. Replace it there before deleting." });
    await getR2Client().send(new DeleteObjectCommand({ Bucket: getR2BucketName(), Key: item.objectKey }));
    await collection.deleteOne({ _id: id });
    return json(res, 200, { success: true });
  }
  res.setHeader("Allow", "GET, POST, PUT, DELETE");
  return json(res, 405, { success: false, message: "Method not allowed." });
}
