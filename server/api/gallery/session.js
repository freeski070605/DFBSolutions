import { requireGalleryEventAccess } from "../_lib/galleryAuth.js";
import { sanitizeGalleryEventForClient } from "../_lib/galleryData.js";
import { json } from "../_lib/http.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { success: false, message: "Method not allowed." });
  }
  const event = await requireGalleryEventAccess(req, res, { clearInvalidCookie: true });
  if (!event) return;
  return json(res, 200, { success: true, event: sanitizeGalleryEventForClient(event) });
}
