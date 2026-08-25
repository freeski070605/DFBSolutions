import { clearGallerySession } from "../_lib/galleryAuth.js";
import { allowedOrigin, json } from "../_lib/http.js";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { success: false, message: "Method not allowed." });
  }
  if (!allowedOrigin(req)) return json(res, 403, { success: false, message: "Request origin was rejected." });
  clearGallerySession(res);
  return json(res, 200, { success: true });
}
