import { handleResource } from "../_lib/resource.js";

export default (req, res) => handleResource(req, res, {
  collection: "projects",
  fields: {
    slug: "string", title: "string", division: "string", serviceSlug: "string", category: "string", summary: "string",
    problem: "string", solution: "string", deliverables: "array", features: "array", featured: "boolean",
    published: "boolean", archived: "boolean", accent: "string", coverImage: "string", coverImageAlt: "string", gallery: "array", videoUrl: "string",
    websiteUrl: "string", websiteLabel: "string", seoTitle: "string", seoDescription: "string", sortOrder: "number",
  },
  defaults: { published: true, featured: false, gallery: [], deliverables: [], features: [] },
  searchFields: ["title", "summary", "category", "division"],
  sort: { sortOrder: 1, updatedAt: -1 },
  validate: (item) => !item.title || !item.slug || !["digital", "creative", "property", "transportation"].includes(item.division)
    ? "Title, slug, and a valid division are required."
    : !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) ? "Slug must use lowercase letters, numbers, and hyphens."
      : [item.coverImage, item.videoUrl, item.websiteUrl, ...(item.gallery || []).map((media) => media.src)].some((url) => url && !validUrl(url))
        ? "Media, video, and website links must use valid HTTPS URLs." : "",
});

function validUrl(value) {
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}
