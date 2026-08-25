import { ObjectId } from "mongodb";
import { requireAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import {
  createGalleryCodeHint,
  generateGalleryCode,
  hashGalleryCode,
  normalizeGalleryCode,
} from "../_lib/galleryCodes.js";
import { createGalleryEventRecord, sanitizeGalleryEventForAdmin } from "../_lib/galleryData.js";
import { cleanText, json, parseBody } from "../_lib/http.js";

const CREATE_FIELDS = new Set(["title", "eventCode", "generateCode", "eventDate", "expiresAt", "published", "downloadsEnabled"]);
const UPDATE_FIELDS = new Set(["title", "eventDate", "expiresAt", "published", "downloadsEnabled"]);
const RESET_FIELDS = new Set(["eventCode", "generateCode"]);
const ACTIONS = new Set(["reset-code", "publish", "unpublish", "archive", "unarchive"]);

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  res.setHeader("Cache-Control", "private, no-store");

  const db = await getDb();
  if (req.method === "GET") return handleGet(req, res, db);

  if (req.method === "POST") {
    const action = cleanText(req.query?.action, 30);
    if (action) return handleAction(req, res, db, admin, action);
    return handleCreate(req, res, db, admin);
  }

  if (req.method === "PUT") return handleUpdate(req, res, db, admin);

  res.setHeader("Allow", "GET, POST, PUT");
  return json(res, 405, { success: false, message: "Method not allowed." });
}

async function handleGet(req, res, db) {
  const id = cleanText(req.query?.id, 50);
  if (id) {
    const eventId = parseObjectId(id);
    if (!eventId) return json(res, 400, { success: false, message: "A valid gallery event ID is required." });
    const event = await db.collection("gallery_events").findOne({ _id: eventId }, { projection: { codeHash: 0 } });
    if (!event) return json(res, 404, { success: false, message: "Gallery event not found." });
    return json(res, 200, { success: true, item: sanitizeGalleryEventForAdmin(event) });
  }

  const page = Math.max(1, Number(req.query?.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query?.limit) || 50));
  const collection = db.collection("gallery_events");
  const [events, total] = await Promise.all([
    collection.find({}, { projection: { codeHash: 0 } })
      .sort({ eventDate: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    collection.countDocuments(),
  ]);
  return json(res, 200, {
    success: true,
    items: events.map(sanitizeGalleryEventForAdmin),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

async function handleCreate(req, res, db, admin) {
  const body = validBody(parseBody(req));
  if (!body) return json(res, 400, { success: false, message: "Submit a valid gallery event." });
  if (!hasOnlyFields(body, CREATE_FIELDS)) return json(res, 400, { success: false, message: "Request contains unsupported fields." });

  let common;
  try {
    common = {
      title: requiredTitle(body.title),
      eventDate: nullableDate(body.eventDate, "Event date"),
      expiresAt: nullableDate(body.expiresAt, "Expiration date"),
      published: optionalBoolean(body, "published", false),
      downloadsEnabled: optionalBoolean(body, "downloadsEnabled", true),
    };
  } catch (error) {
    return json(res, 400, { success: false, message: error.message });
  }

  const generated = body.generateCode === true;
  if (Object.hasOwn(body, "generateCode") && typeof body.generateCode !== "boolean") {
    return json(res, 400, { success: false, message: "generateCode must be a boolean." });
  }
  if (generated && body.eventCode != null) {
    return json(res, 400, { success: false, message: "Choose either a supplied code or a generated code." });
  }
  if (!generated && !Object.hasOwn(body, "eventCode")) {
    return json(res, 400, { success: false, message: "Provide an event code or request a generated code." });
  }

  const maxAttempts = generated ? 5 : 1;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let code;
    try {
      code = prepareCode(generated ? generateGalleryCode() : body.eventCode);
    } catch (error) {
      return json(res, 400, { success: false, message: error.message });
    }
    const document = createGalleryEventRecord(
      { ...common, codeHash: code.hash, codeHint: code.hint },
      { actor: admin.email },
    );
    try {
      const result = await db.collection("gallery_events").insertOne(document);
      const event = { ...document, _id: result.insertedId };
      await recordGalleryAudit(db, admin, "gallery_created", result.insertedId);
      return json(res, 201, { success: true, item: sanitizeGalleryEventForAdmin(event), eventCode: code.normalized });
    } catch (error) {
      if (!isDuplicateKey(error)) throw error;
      if (!generated) return duplicateCode(res);
    }
  }
  return json(res, 503, { success: false, message: "A unique gallery code could not be generated. Try again." });
}

async function handleUpdate(req, res, db, admin) {
  const eventId = parseObjectId(cleanText(req.query?.id, 50));
  if (!eventId) return json(res, 400, { success: false, message: "A valid gallery event ID is required." });
  const body = validBody(parseBody(req));
  if (!body || !hasOnlyFields(body, UPDATE_FIELDS) || !Object.keys(body).length) {
    return json(res, 400, { success: false, message: "Submit at least one supported event field." });
  }

  const existing = await db.collection("gallery_events").findOne({ _id: eventId });
  if (!existing) return json(res, 404, { success: false, message: "Gallery event not found." });

  const updates = {};
  try {
    if (Object.hasOwn(body, "title")) updates.title = requiredTitle(body.title);
    if (Object.hasOwn(body, "eventDate")) updates.eventDate = nullableDate(body.eventDate, "Event date");
    if (Object.hasOwn(body, "expiresAt")) updates.expiresAt = nullableDate(body.expiresAt, "Expiration date");
    if (Object.hasOwn(body, "downloadsEnabled")) updates.downloadsEnabled = requiredBoolean(body.downloadsEnabled, "downloadsEnabled");
    if (Object.hasOwn(body, "published")) updates.published = requiredBoolean(body.published, "published");
  } catch (error) {
    return json(res, 400, { success: false, message: error.message });
  }
  if (existing.archivedAt != null && updates.published === true) {
    return json(res, 409, { success: false, message: "Unarchive the gallery before publishing it." });
  }
  if (existing.archivedAt != null) updates.published = false;

  const now = new Date();
  updates.updatedAt = now;
  updates.updatedBy = admin.email;
  const operation = { $set: updates };
  if (existing.published === true && updates.published === false) operation.$inc = { accessVersion: 1 };
  const updated = await db.collection("gallery_events").findOneAndUpdate(
    { _id: eventId },
    operation,
    { returnDocument: "after" },
  );
  const auditAction = existing.published !== updated.published
    ? updated.published ? "gallery_published" : "gallery_unpublished"
    : "gallery_updated";
  await recordGalleryAudit(db, admin, auditAction, eventId);
  return json(res, 200, { success: true, item: sanitizeGalleryEventForAdmin(updated) });
}

async function handleAction(req, res, db, admin, action) {
  if (!ACTIONS.has(action)) return json(res, 400, { success: false, message: "Unsupported gallery action." });
  const eventId = parseObjectId(cleanText(req.query?.id, 50));
  if (!eventId) return json(res, 400, { success: false, message: "A valid gallery event ID is required." });
  if (action === "reset-code") return resetEventCode(req, res, db, admin, eventId);

  const body = validBody(parseBody(req));
  if (!body || Object.keys(body).length) return json(res, 400, { success: false, message: "This action does not accept fields." });
  const existing = await db.collection("gallery_events").findOne({ _id: eventId });
  if (!existing) return json(res, 404, { success: false, message: "Gallery event not found." });

  const now = new Date();
  const set = { updatedAt: now, updatedBy: admin.email };
  const update = { $set: set };
  let auditAction;
  if (action === "publish") {
    if (existing.archivedAt != null) return json(res, 409, { success: false, message: "Unarchive the gallery before publishing it." });
    set.published = true;
    auditAction = "gallery_published";
  } else if (action === "unpublish") {
    set.published = false;
    if (existing.published === true) update.$inc = { accessVersion: 1 };
    auditAction = "gallery_unpublished";
  } else if (action === "archive") {
    set.archivedAt = now;
    set.published = false;
    if (existing.archivedAt == null) update.$inc = { accessVersion: 1 };
    auditAction = "gallery_archived";
  } else {
    set.archivedAt = null;
    set.published = false;
    auditAction = "gallery_unarchived";
  }

  const updated = await db.collection("gallery_events").findOneAndUpdate(
    { _id: eventId },
    update,
    { returnDocument: "after" },
  );
  await recordGalleryAudit(db, admin, auditAction, eventId);
  return json(res, 200, { success: true, item: sanitizeGalleryEventForAdmin(updated) });
}

async function resetEventCode(req, res, db, admin, eventId) {
  const body = validBody(parseBody(req));
  if (!body || !hasOnlyFields(body, RESET_FIELDS)) {
    return json(res, 400, { success: false, message: "Submit a valid code reset request." });
  }
  const generated = body.generateCode === true;
  if (Object.hasOwn(body, "generateCode") && typeof body.generateCode !== "boolean") {
    return json(res, 400, { success: false, message: "generateCode must be a boolean." });
  }
  if (generated && body.eventCode != null) {
    return json(res, 400, { success: false, message: "Choose either a supplied code or a generated code." });
  }
  if (!generated && !Object.hasOwn(body, "eventCode")) {
    return json(res, 400, { success: false, message: "Provide a new code or request a generated code." });
  }

  if (!await db.collection("gallery_events").findOne({ _id: eventId }, { projection: { _id: 1 } })) {
    return json(res, 404, { success: false, message: "Gallery event not found." });
  }
  const maxAttempts = generated ? 5 : 1;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let code;
    try {
      code = prepareCode(generated ? generateGalleryCode() : body.eventCode);
    } catch (error) {
      return json(res, 400, { success: false, message: error.message });
    }
    try {
      const updated = await db.collection("gallery_events").findOneAndUpdate(
        { _id: eventId },
        {
          $set: { codeHash: code.hash, codeHint: code.hint, updatedAt: new Date(), updatedBy: admin.email },
          $inc: { accessVersion: 1 },
        },
        { returnDocument: "after" },
      );
      await recordGalleryAudit(db, admin, "gallery_code_reset", eventId);
      return json(res, 200, { success: true, item: sanitizeGalleryEventForAdmin(updated), eventCode: code.normalized });
    } catch (error) {
      if (!isDuplicateKey(error)) throw error;
      if (!generated) return duplicateCode(res);
    }
  }
  return json(res, 503, { success: false, message: "A unique gallery code could not be generated. Try again." });
}

function prepareCode(value) {
  const normalized = normalizeGalleryCode(value);
  return { normalized, hash: hashGalleryCode(normalized), hint: createGalleryCodeHint(normalized) };
}

function validBody(body) {
  return body && typeof body === "object" && !Array.isArray(body) ? body : null;
}

function hasOnlyFields(body, allowed) {
  return Object.keys(body).every((key) => allowed.has(key));
}

function requiredTitle(value) {
  if (typeof value !== "string" || !value.trim()) throw new Error("Gallery title is required.");
  if (value.trim().length > 200) throw new Error("Gallery title must contain 200 characters or fewer.");
  return value.trim();
}

function nullableDate(value, label) {
  if (value == null || value === "") return null;
  if (typeof value !== "string" && !(value instanceof Date)) throw new Error(`${label} is invalid.`);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} is invalid.`);
  return date;
}

function optionalBoolean(body, field, fallback) {
  return Object.hasOwn(body, field) ? requiredBoolean(body[field], field) : fallback;
}

function requiredBoolean(value, field) {
  if (typeof value !== "boolean") throw new Error(`${field} must be a boolean.`);
  return value;
}

function parseObjectId(value) {
  return /^[a-f0-9]{24}$/i.test(value || "") ? new ObjectId(value) : null;
}

function isDuplicateKey(error) {
  return error?.code === 11000;
}

function duplicateCode(res) {
  return json(res, 409, { success: false, message: "That gallery code is already in use." });
}

async function recordGalleryAudit(db, admin, action, resourceId) {
  await db.collection("audit_log").insertOne({
    action,
    resource: "gallery_events",
    resourceId,
    adminId: admin.id,
    adminEmail: admin.email,
    createdAt: new Date(),
  });
}
