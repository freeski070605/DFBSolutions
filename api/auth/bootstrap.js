import bcrypt from "bcryptjs";
import { getDb } from "../_lib/db.js";
import { cleanText, json, parseBody } from "../_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { success: false, message: "Method not allowed." });
  const setupKey = req.headers?.["x-setup-key"];
  if (!process.env.ADMIN_SETUP_KEY || setupKey !== process.env.ADMIN_SETUP_KEY) {
    return json(res, 403, { success: false, message: "Invalid setup key." });
  }
  const db = await getDb();
  if (await db.collection("admins").countDocuments()) {
    return json(res, 409, { success: false, message: "An administrator already exists." });
  }
  const body = parseBody(req);
  const email = cleanText(body?.email, 200).toLowerCase();
  const password = cleanText(body?.password, 200);
  const name = cleanText(body?.name, 120) || "DFB Administrator";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { success: false, message: "Enter a valid email." });
  if (password.length < 12) return json(res, 400, { success: false, message: "Password must contain at least 12 characters." });
  const passwordHash = await bcrypt.hash(password, 12);
  await db.collection("admins").insertOne({ email, name, passwordHash, role: "owner", active: true, createdAt: new Date(), updatedAt: new Date() });
  return json(res, 201, { success: true, message: "Administrator created. Remove ADMIN_SETUP_KEY from the environment now." });
}
