import bcrypt from "bcryptjs";
import { checkLoginRate, clearLoginFailures, createSession, recordLoginFailure, setSessionCookie } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { cleanText, json, parseBody } from "../_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { success: false, message: "Method not allowed." });
  const rate = await checkLoginRate(req);
  if (rate.blocked) return json(res, 429, { success: false, message: "Too many attempts. Try again in 15 minutes." });
  const body = parseBody(req);
  const email = cleanText(body?.email, 200).toLowerCase();
  const password = cleanText(body?.password, 200);
  const db = await getDb();
  const admin = await db.collection("admins").findOne({ email, active: true });
  const valid = admin && await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    await recordLoginFailure(rate.key);
    return json(res, 401, { success: false, message: "Email or password is incorrect." });
  }
  await clearLoginFailures(rate.key);
  await db.collection("admins").updateOne({ _id: admin._id }, { $set: { lastLoginAt: new Date() } });
  setSessionCookie(res, await createSession(admin));
  return json(res, 200, { success: true, user: { email: admin.email, name: admin.name, role: admin.role } });
}
