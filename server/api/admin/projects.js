import { handleResource } from "../_lib/resource.js";

export default (req, res) => handleResource(req, res, {
  collection: "projects",
  fields: {
    slug: "string", title: "string", division: "string", category: "string", summary: "string",
    problem: "string", solution: "string", deliverables: "array", features: "array", featured: "boolean",
    published: "boolean", accent: "string", coverImage: "string", gallery: "array", videoUrl: "string",
    websiteUrl: "string", websiteLabel: "string", sortOrder: "number",
  },
  defaults: { published: true, featured: false, gallery: [], deliverables: [], features: [] },
  searchFields: ["title", "summary", "category", "division"],
  sort: { sortOrder: 1, updatedAt: -1 },
  validate: (item) => !item.title || !item.slug || !["digital", "creative", "property", "transportation"].includes(item.division)
    ? "Title, slug, and a valid division are required."
    : !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) ? "Slug must use lowercase letters, numbers, and hyphens." : "",
});
