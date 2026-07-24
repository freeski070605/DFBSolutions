import { clearSessionCookie } from "../_lib/auth.js";
import { json } from "../_lib/http.js";

export default function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { success: false, message: "Method not allowed." });
  clearSessionCookie(res);
  return json(res, 200, { success: true });
}
