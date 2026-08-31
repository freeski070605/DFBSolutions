import { requireAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { json, parseBody, sanitizeObject } from "../_lib/http.js";

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const db = await getDb();
  const collection = db.collection("site_content");
  if (req.method === "GET") {
    const item = await collection.findOne({ key: "global" });
    return json(res, 200, { success: true, items: item ? [item] : [] });
  }
  if (["POST", "PUT"].includes(req.method)) {
    const safe = sanitizeObject(parseBody(req));
    const content = { home: safe.home || {}, about: safe.about || {}, global: safe.global || {}, updatedAt: new Date(), updatedBy: admin.email };
    const item = await collection.findOneAndUpdate({ key: "global" }, { $set: content, $setOnInsert: { key: "global", createdAt: new Date() } }, { upsert: true, returnDocument: "after" });
    return json(res, 200, { success: true, item });
  }
  res.setHeader("Allow", "GET, POST, PUT");
  return json(res, 405, { success: false, message: "Method not allowed." });
}
