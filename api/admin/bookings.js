import { handleResource } from "../_lib/resource.js";

export default (req, res) => handleResource(req, res, {
  collection: "bookings",
  fields: {
    title: "string", customerId: "string", customerName: "string", division: "string", type: "string",
    status: "string", startAt: "date", endAt: "date", city: "string", locationPrivate: "string",
    amount: "number", paymentStatus: "string", notes: "string", itinerary: "string", deliverables: "array",
  },
  defaults: { status: "inquiry", paymentStatus: "not-set", deliverables: [] },
  searchFields: ["title", "customerName", "division", "type", "notes"],
  sort: { startAt: 1, updatedAt: -1 },
  validate: (item) => !item.title || !item.division ? "Title and division are required." : "",
});
