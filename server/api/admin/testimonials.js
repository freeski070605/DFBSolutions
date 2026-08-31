import { handleResource } from "../_lib/resource.js";

export default (req, res) => handleResource(req, res, {
  collection: "testimonials",
  fields: { clientName: "string", businessEvent: "string", serviceType: "string", serviceSlugs: "array", quote: "string", imageUrl: "string", imageAlt: "string", public: "boolean", featured: "boolean", sortOrder: "number" },
  defaults: { public: false, featured: false, serviceSlugs: [], sortOrder: 0 },
  searchFields: ["clientName", "businessEvent", "serviceType", "quote"], sort: { sortOrder: 1, updatedAt: -1 },
  validate: (item) => !item.clientName || !item.quote ? "Client name and testimonial are required."
    : item.imageUrl && !validUrl(item.imageUrl) ? "The optional image must use a valid HTTPS URL." : "",
});
function validUrl(value) { try { return new URL(value).protocol === "https:"; } catch { return false; } }
