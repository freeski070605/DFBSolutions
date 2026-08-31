import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const ALLOWED = new Map([
  ["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"], ["application/pdf", "pdf"],
  ["application/msword", "doc"], ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
]);
export const MAX_INQUIRY_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_INQUIRY_FILES = 5;
export function validateInquiryFile({ name, type, size }) {
  const contentType = ALLOWED.has(type) ? type : type === "image/jpg" ? "image/jpeg" : "";
  if (!contentType || !Number.isFinite(Number(size)) || Number(size) < 1 || Number(size) > MAX_INQUIRY_FILE_SIZE) return null;
  const cleanName = String(name || "attachment").replace(/[^\w.\- ()]/g, "_").slice(0, 120);
  return { name: cleanName, contentType, extension: ALLOWED.get(contentType), size: Number(size) };
}
export function createInquiryObjectKey(extension) {
  return "inquiries/pending/" + new Date().toISOString().slice(0, 10) + "/" + randomUUID() + "." + extension;
}
export function signInquiryUpload(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 30 * 60 * 1000 })).toString("base64url");
  return body + "." + createHmac("sha256", uploadSecret()).update(body).digest("base64url");
}
export function verifyInquiryUpload(token) {
  try {
    const [body, signature] = String(token || "").split(".");
    const expected = createHmac("sha256", uploadSecret()).update(body).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    return payload.exp > Date.now() && String(payload.key).startsWith("inquiries/pending/") ? payload : null;
  } catch { return null; }
}
function uploadSecret() {
  const value = process.env.INQUIRY_UPLOAD_SECRET || process.env.GALLERY_AUTH_SECRET || process.env.AUTH_SECRET;
  if (!value || value.length < 24) throw new Error("A strong inquiry upload signing secret is required.");
  return value;
}
