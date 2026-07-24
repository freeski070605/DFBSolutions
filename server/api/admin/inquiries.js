import { handleResource } from "../_lib/resource.js";

export default (req, res) => handleResource(req, res, {
  collection: "inquiries",
  fields: {
    inquiryType: "string", status: "string", name: "string", email: "string", phone: "string",
    details: "object", notes: "string", assignedTo: "string", source: "string",
  },
  defaults: { status: "new", source: "admin" },
  searchFields: ["name", "email", "phone", "inquiryType", "notes"],
  validate: (item) => !item.name || !item.email ? "Name and email are required." : "",
});
