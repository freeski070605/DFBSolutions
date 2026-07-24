import { SignJWT, jwtVerify } from "jose";
import { getDb } from "./db.js";
import { allowedOrigin, getRequestIp, json } from "./http.js";

const COOKIE = "dfb_admin_session";
const encoder = new TextEncoder();

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters.");
  return encoder.encode(value);
}

export async function createSession(admin) {
  return new SignJWT({ email: admin.email, role: admin.role || "admin", name: admin.name || "Admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(admin._id))
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret());
}

export function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === "production";
  res.setHeader("Set-Cookie", `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=43200${secure ? "; Secure" : ""}`);
}

export function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === "production";
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? "; Secure" : ""}`);
}

export async function getSession(req) {
  const cookies = Object.fromEntries(String(req.headers?.cookie || "").split(";").map((part) => part.trim().split(/=(.*)/s)).filter(([key]) => key));
  const token = cookies[COOKIE];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { id: payload.sub, email: payload.email, role: payload.role, name: payload.name };
  } catch {
    return null;
  }
}

export async function requireAdmin(req, res) {
  if (!["GET", "HEAD"].includes(req.method) && !allowedOrigin(req)) {
    json(res, 403, { success: false, message: "Request origin was rejected." });
    return null;
  }
  const session = await getSession(req);
  if (!session) {
    json(res, 401, { success: false, message: "Admin authentication is required." });
    return null;
  }
  return session;
}

export async function checkLoginRate(req) {
  const db = await getDb();
  const key = getRequestIp(req);
  const now = new Date();
  const record = await db.collection("login_attempts").findOne({ key, expiresAt: { $gt: now } });
  return { blocked: (record?.attempts || 0) >= 8, key };
}

export async function recordLoginFailure(key) {
  const db = await getDb();
  await db.collection("login_attempts").updateOne(
    { key },
    { $inc: { attempts: 1 }, $setOnInsert: { expiresAt: new Date(Date.now() + 15 * 60 * 1000) } },
    { upsert: true },
  );
}

export async function clearLoginFailures(key) {
  const db = await getDb();
  await db.collection("login_attempts").deleteOne({ key });
}
