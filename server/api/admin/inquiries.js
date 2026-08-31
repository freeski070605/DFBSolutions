import { handleResource } from "../_lib/resource.js";

export default (req, res) => handleResource(req, res, {
  collection: "inquiries",
  fields: {
    inquiryType: "string", serviceCategory: "string", serviceType: "string", projectSubtype: "string",
    status: "string", name: "string", email: "string", phone: "string", eventDate: "string",
    location: "string", budget: "string", details: "object", attachments: "array", notes: "string", assignedTo: "string", source: "string",
  },
  defaults: { status: "new", source: "admin" },
  searchFields: ["name", "email", "phone", "inquiryType", "serviceCategory", "serviceType", "projectSubtype", "notes"],
  validate: (item) => !item.name || !item.email ? "Name and email are required." : "",
});
