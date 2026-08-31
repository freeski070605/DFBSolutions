import { getDb } from "../_lib/db.js";
import { json } from "../_lib/http.js";
export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { success: false, message: "Method not allowed." });
  try {
    const items = await (await getDb()).collection("testimonials").find({ public: true }, { projection: { _id: 0, createdBy: 0, updatedBy: 0, approvedBy: 0, createdAt: 0, updatedAt: 0 } }).sort({ sortOrder: 1 }).toArray();
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
    return json(res, 200, { success: true, items });
  } catch { return json(res, 503, { success: false, message: "Managed content is temporarily unavailable." }); }
}
