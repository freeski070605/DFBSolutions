import { handleResource } from "../_lib/resource.js";

export default (req, res) => handleResource(req, res, {
  collection: "divisions",
  fields: {
    slug: "string", name: "string", shortName: "string", accent: "string", statement: "string",
    prompt: "string", intro: "string", problems: "array", capabilities: "array", process: "array",
    faqs: "array", published: "boolean", sortOrder: "number",
  },
  defaults: { published: true, problems: [], capabilities: [], process: [], faqs: [] },
  searchFields: ["name", "statement", "intro"],
  sort: { sortOrder: 1 },
  validate: (item) => !item.name || !item.slug ? "Name and slug are required." : "",
});
