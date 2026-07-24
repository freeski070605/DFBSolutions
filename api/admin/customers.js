import { handleResource } from "../_lib/resource.js";

export default (req, res) => handleResource(req, res, {
  collection: "customers",
  fields: {
    name: "string", email: "string", phone: "string", company: "string", status: "string",
    divisions: "array", notes: "string", city: "string", tags: "array", inquiryIds: "array",
  },
  defaults: { status: "lead", divisions: [], tags: [] },
  searchFields: ["name", "email", "phone", "company", "notes"],
  validate: (item) => !item.name ? "Customer name is required." : "",
});
