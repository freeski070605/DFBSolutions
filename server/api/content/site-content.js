import { getDb } from "../_lib/db.js";
import { json } from "../_lib/http.js";
export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { success: false, message: "Method not allowed." });
  try {
    const item = await (await getDb()).collection("site_content").findOne({ key: "global" }, { projection: { key: 0, createdBy: 0, updatedBy: 0, updatedAt: 0, _id: 0 } });
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
    return json(res, 200, { success: true, item: item || null });
  } catch { return json(res, 503, { success: false, message: "Managed content is temporarily unavailable." }); }
}
