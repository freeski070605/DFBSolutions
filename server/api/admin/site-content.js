import { requireAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { json, parseBody, sanitizeObject } from "../_lib/http.js";

const pages = ["home", "about", "global"];
const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  res.setHeader("Cache-Control", "private, no-store");
  const db = await getDb();
  const collection = db.collection("site_content");
  const page = String(req.query?.page || "");
  if (req.method === "GET") {
    const item = await collection.findOne({ key: "global" });
    if (req.query?.search) {
      const term = String(req.query.search).trim().toLowerCase().slice(0, 80);
      const matchingPages = pages.filter((key) => key.includes(term) || JSON.stringify(item?.draft?.[key] || item?.[key] || {}).toLowerCase().includes(term));
      const media = await db.collection("site_media").find({ status: "ready", filename: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }, { projection: { filename: 1 } }).limit(5).toArray();
      return json(res, 200, { success: true, matchingPages, media: media.map((asset) => ({ id: String(asset._id), filename: asset.filename })) });
    }
    if (!page) return json(res, 200, { success: true, pages: pages.map((key) => ({ key, updatedAt: item?.draftMeta?.[key]?.updatedAt || item?.updatedAt, publishedAt: item?.publishedMeta?.[key]?.publishedAt || item?.updatedAt, hasDraft: Boolean(item?.draft?.[key]) })) });
    if (!pages.includes(page)) return json(res, 400, { success: false, message: "Unknown page." });
    if (req.query?.history === "1") {
      const history = await db.collection("site_content_history").find({ page }).sort({ createdAt: -1 }).limit(15).toArray();
      return json(res, 200, { success: true, history });
    }
    return json(res, 200, { success: true, page, live: item?.[page] || {}, draft: item?.draft?.[page] || null, updatedAt: item?.draftMeta?.[page]?.updatedAt || item?.updatedAt, publishedAt: item?.publishedMeta?.[page]?.publishedAt || item?.updatedAt });
  }
  if (!["POST", "PUT"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST, PUT");
    return json(res, 405, { success: false, message: "Method not allowed." });
  }
  if (!pages.includes(page)) return json(res, 400, { success: false, message: "Unknown page." });
  const body = sanitizeObject(parseBody(req));
  if (!isObject(body.content)) return json(res, 400, { success: false, message: "Page content is required." });
  const now = new Date();
  if (req.method === "PUT") {
    await collection.updateOne({ key: "global" }, { $set: { [`draft.${page}`]: body.content, [`draftMeta.${page}`]: { updatedAt: now, updatedBy: admin.email } }, $setOnInsert: { key: "global", createdAt: now } }, { upsert: true });
    await db.collection("site_content_history").insertOne({ page, content: body.content, status: "draft", createdAt: now, updatedBy: admin.email });
    return json(res, 200, { success: true, updatedAt: now, content: body.content });
  }
  const current = await collection.findOne({ key: "global" });
  const saved = current?.draft?.[page];
  if (!saved || JSON.stringify(saved) !== JSON.stringify(body.content)) return json(res, 409, { success: false, message: "Save this draft before publishing." });
  await collection.updateOne({ key: "global" }, { $set: { [page]: saved, [`publishedMeta.${page}`]: { publishedAt: now, publishedBy: admin.email }, updatedAt: now, updatedBy: admin.email }, $unset: { [`draft.${page}`]: "", [`draftMeta.${page}`]: "" } });
  await db.collection("site_content_history").insertOne({ page, content: saved, status: "published", createdAt: now, updatedBy: admin.email });
  return json(res, 200, { success: true, publishedAt: now });
}
