export function json(res, status, payload) {
  return res.status(status).json(payload);
}

export function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  return {};
}

export function cleanText(value, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function cleanArray(value, maxItems = 30) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maxItems).map((item) => {
    if (typeof item === "string") return cleanText(item, 500);
    if (Array.isArray(item)) return item.slice(0, 2).map((part) => cleanText(part, 3000));
    if (item && typeof item === "object") return sanitizeObject(item);
    return "";
  }).filter(Boolean);
}

export function sanitizeObject(value, depth = 0) {
  if (!value || typeof value !== "object" || Array.isArray(value) || depth > 3) return {};
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key) || key.startsWith("$")) continue;
    if (typeof item === "string") output[key] = cleanText(item, 3000);
    else if (typeof item === "number" || typeof item === "boolean" || item === null) output[key] = item;
    else if (Array.isArray(item)) output[key] = cleanArray(item);
    else if (typeof item === "object") output[key] = sanitizeObject(item, depth + 1);
  }
  return output;
}

export function getRequestIp(req) {
  const forwarded = req.headers?.["x-forwarded-for"];
  return (typeof forwarded === "string" ? forwarded.split(",")[0] : req.socket?.remoteAddress || "unknown").trim();
}

export function allowedOrigin(req) {
  const origin = req.headers?.origin;
  if (!origin) return true;
  const host = req.headers?.["x-forwarded-host"] || req.headers?.host;
  try { return new URL(origin).host === host; } catch { return false; }
}
