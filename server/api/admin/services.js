import { handleResource } from "../_lib/resource.js";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export default (req, res) => handleResource(req, res, {
  collection: "services",
  fields: {
    slug: "string", name: "string", category: "string", eyebrow: "string", headline: "string", intro: "string",
    heroMedia: "object", serviceItems: "array", included: "array", process: "array", gallery: "array", pricing: "object",
    turnaround: "string", faqs: "array", featuredProjectSlugs: "array", testimonialIds: "array", ctaLabel: "string",
    ctaService: "string", ctaSubtype: "string", seoTitle: "string", seoDescription: "string", seoImage: "string",
    accent: "string", primary: "boolean", active: "boolean", sortOrder: "number",
  },
  defaults: { active: true, primary: true, serviceItems: [], included: [], process: [], gallery: [], faqs: [] },
  searchFields: ["name", "slug", "category", "headline"], sort: { sortOrder: 1, updatedAt: -1 },
  validate: async (item, { collection, id }) => {
    if (!item.name || !slugPattern.test(item.slug || "")) return "Name and a valid lowercase slug are required.";
    const urls = [item.heroMedia?.src, item.heroMedia?.poster, item.seoImage, ...(item.gallery || []).map((media) => media.src)].filter(Boolean);
    if (urls.some((value) => !validUrl(value))) return "Service media must use valid HTTPS URLs.";
    const duplicate = await collection.findOne({ slug: item.slug, ...(id ? { _id: { $ne: id } } : {}) });
    return duplicate ? "That service slug is already in use." : "";
  },
});
function validUrl(value) { try { return new URL(value).protocol === "https:"; } catch { return false; } }
