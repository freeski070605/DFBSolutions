import { getSession } from "../_lib/auth.js";
import { json } from "../_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { success: false, message: "Method not allowed." });
  const user = await getSession(req);
  return user ? json(res, 200, { success: true, user }) : json(res, 401, { success: false, user: null });
}
