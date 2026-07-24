import { requireAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { json } from "../_lib/http.js";

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  if (req.method !== "GET") return json(res, 405, { success: false, message: "Method not allowed." });
  const db = await getDb();
  const now = new Date();
  const inThirtyDays = new Date(now.getTime() + 30 * 86400000);
  const [newInquiries, customers, publishedProjects, upcomingBookings, recent] = await Promise.all([
    db.collection("inquiries").countDocuments({ status: "new" }),
    db.collection("customers").countDocuments(),
    db.collection("projects").countDocuments({ published: true }),
    db.collection("bookings").countDocuments({ startAt: { $gte: now, $lte: inThirtyDays }, status: { $nin: ["cancelled", "completed"] } }),
    db.collection("inquiries").find().sort({ createdAt: -1 }).limit(6).toArray(),
  ]);
  return json(res, 200, { success: true, metrics: { newInquiries, customers, publishedProjects, upcomingBookings }, recent });
}
