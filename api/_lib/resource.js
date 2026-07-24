import { ObjectId } from "mongodb";
import { getDb } from "./db.js";
import { requireAdmin } from "./auth.js";
import { cleanArray, cleanText, json, parseBody, sanitizeObject } from "./http.js";

export async function handleResource(req, res, config) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const db = await getDb();
  const collection = db.collection(config.collection);
  const now = new Date();

  if (req.method === "GET") {
    const page = Math.max(1, Number(req.query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query?.limit) || 50));
    const query = {};
    const search = cleanText(req.query?.search, 100);
    const status = cleanText(req.query?.status, 50);
    if (status) query.status = status;
    if (search && config.searchFields?.length) {
      query.$or = config.searchFields.map((field) => ({ [field]: { $regex: escapeRegex(search), $options: "i" } }));
    }
    const [items, total] = await Promise.all([
      collection.find(query).sort(config.sort || { updatedAt: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);
    return json(res, 200, { success: true, items, total, page, pages: Math.ceil(total / limit) });
  }

  if (req.method === "POST") {
    const input = buildDocument(parseBody(req), config);
    const document = { ...config.defaults, ...input, createdAt: now, updatedAt: now, createdBy: admin.email };
    if (config.validate) {
      const error = config.validate(document);
      if (error) return json(res, 400, { success: false, message: error });
    }
    const result = await collection.insertOne(document);
    await audit(db, admin, "create", config.collection, result.insertedId);
    return json(res, 201, { success: true, item: { ...document, _id: result.insertedId } });
  }

  if (req.method === "PUT") {
    const id = cleanText(req.query?.id, 50);
    if (!ObjectId.isValid(id)) return json(res, 400, { success: false, message: "A valid record ID is required." });
    const input = buildDocument(parseBody(req), config);
    const document = { ...input, updatedAt: now, updatedBy: admin.email };
    if (config.validate) {
      const existing = await collection.findOne({ _id: new ObjectId(id) });
      const error = config.validate({ ...existing, ...document });
      if (error) return json(res, 400, { success: false, message: error });
    }
    const updated = await collection.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: document }, { returnDocument: "after" });
    if (!updated) return json(res, 404, { success: false, message: "Record not found." });
    await audit(db, admin, "update", config.collection, new ObjectId(id));
    return json(res, 200, { success: true, item: updated });
  }

  if (req.method === "DELETE") {
    const id = cleanText(req.query?.id, 50);
    if (!ObjectId.isValid(id)) return json(res, 400, { success: false, message: "A valid record ID is required." });
    const deleted = await collection.deleteOne({ _id: new ObjectId(id) });
    if (!deleted.deletedCount) return json(res, 404, { success: false, message: "Record not found." });
    await audit(db, admin, "delete", config.collection, new ObjectId(id));
    return json(res, 200, { success: true });
  }

  res.setHeader("Allow", "GET, POST, PUT, DELETE");
  return json(res, 405, { success: false, message: "Method not allowed." });
}

function buildDocument(body, config) {
  const safe = sanitizeObject(body);
  const output = {};
  for (const [field, type] of Object.entries(config.fields)) {
    if (!Object.hasOwn(safe, field)) continue;
    const value = safe[field];
    if (type === "string") output[field] = cleanText(value, 3000);
    else if (type === "array") output[field] = cleanArray(value);
    else if (type === "boolean") output[field] = Boolean(value);
    else if (type === "number") output[field] = Number.isFinite(Number(value)) ? Number(value) : 0;
    else if (type === "date") output[field] = value ? new Date(value) : null;
    else if (type === "object") output[field] = sanitizeObject(value);
  }
  return output;
}

async function audit(db, admin, action, resource, resourceId) {
  await db.collection("audit_log").insertOne({ action, resource, resourceId, adminId: admin.id, adminEmail: admin.email, createdAt: new Date() });
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
