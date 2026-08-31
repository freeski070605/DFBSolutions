import { requireAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { json } from "../_lib/http.js";
import { projects } from "../../../src/data/projects.js";
import { divisions } from "../../../src/data/divisions.js";
import { servicePages } from "../../../src/data/servicePages.js";

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  if (req.method !== "POST") return json(res, 405, { success: false, message: "Method not allowed." });
  const db = await getDb();
  let added = 0;
  for (const [index, project] of projects.entries()) {
    const result = await db.collection("projects").updateOne(
      { slug: project.slug },
      { $setOnInsert: { ...project, published: true, coverImage: "", gallery: [], videoUrl: "", websiteUrl: "", websiteLabel: "", sortOrder: index, createdAt: new Date(), updatedAt: new Date(), createdBy: admin.email } },
      { upsert: true },
    );
    if (result.upsertedCount) added += 1;
  }
  let divisionsAdded = 0;
  for (const [index, division] of divisions.entries()) {
    const { icon, ...serializable } = division;
    const result = await db.collection("divisions").updateOne(
      { slug: division.slug },
      { $setOnInsert: { ...serializable, published: true, sortOrder: index, createdAt: new Date(), updatedAt: new Date(), createdBy: admin.email } },
      { upsert: true },
    );
    if (result.upsertedCount) divisionsAdded += 1;
  }
  let servicesAdded = 0;
  for (const service of servicePages) {
    const result = await db.collection("services").updateOne(
      { slug: service.slug },
      { $setOnInsert: { ...service, createdAt: new Date(), updatedAt: new Date(), createdBy: admin.email } },
      { upsert: true },
    );
    if (result.upsertedCount) servicesAdded += 1;
  }
  return json(res, 200, { success: true, message: added + " projects, " + divisionsAdded + " legacy divisions, and " + servicesAdded + " services imported. Existing records were preserved." });
}
