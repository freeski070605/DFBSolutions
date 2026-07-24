import { Resend } from "resend";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TYPE_LABELS = {
  digital: "Digital project",
  creative: "Creative project",
  property: "Property project",
  transportation: "Transportation request",
  unsure: "Not sure yet",
};
const FIELD_LABELS = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  detail: "Solution finder detail",
  businessName: "Business or project name",
  projectGoal: "Project goal / description",
  audience: "Audience",
  timeline: "Timeline",
  budget: "Budget",
  existingLink: "Existing website or platform",
  projectKind: "Event, trip, or project type",
  eventDate: "Date",
  location: "Location / city / ZIP",
  coverage: "Coverage",
  duration: "Duration",
  deliverables: "Deliverables",
  referenceLink: "Photo or reference link",
  pickupCity: "Pickup city",
  destination: "Destination or route",
  passengers: "Passengers",
  stops: "Stops",
  specialRequests: "Special requests",
  itineraryFinal: "Itinerary finalized",
};
const REQUIRED_BY_TYPE = {
  digital: ["projectGoal", "budget"],
  creative: ["projectKind", "eventDate", "coverage", "projectGoal"],
  property: ["projectKind", "location", "projectGoal"],
  transportation: ["projectKind", "eventDate", "pickupCity", "destination", "passengers", "itineraryFinal"],
  unsure: ["projectGoal"],
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ success: false, message: "Please submit a valid request." });
  }
  if (typeof body.companyWebsite === "string" && body.companyWebsite.trim()) {
    return res.status(200).json({ success: true, message: "Request received." });
  }

  const inquiryType = clean(body.inquiryType, 50);
  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  if (!TYPE_LABELS[inquiryType]) return res.status(400).json({ success: false, message: "Please choose a request type." });
  if (!name) return res.status(400).json({ success: false, message: "Name is required." });
  if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ success: false, message: "Please enter a valid email address." });

  for (const field of REQUIRED_BY_TYPE[inquiryType]) {
    if (!clean(body[field], 3000)) {
      return res.status(400).json({ success: false, message: `${FIELD_LABELS[field]} is required.` });
    }
  }

  const fields = {};
  for (const key of Object.keys(FIELD_LABELS)) {
    const value = clean(body[key], key === "projectGoal" || key === "specialRequests" ? 3000 : 500);
    if (value) fields[key] = value;
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  if (!resendApiKey || !toEmail || !fromEmail) {
    console.error("Contact delivery configuration is incomplete.");
    return res.status(503).json({ success: false, message: "Message delivery is not configured yet. Please try again later." });
  }

  const rows = Object.entries(fields);
  const text = [
    `New DFB Solutions inquiry: ${TYPE_LABELS[inquiryType]}`,
    "",
    ...rows.map(([key, value]) => `${FIELD_LABELS[key]}: ${value}`),
    `Submitted: ${new Date().toISOString()}`,
  ].join("\n");
  const htmlRows = rows.map(([key, value]) => `<tr><th style="padding:10px;text-align:left;vertical-align:top;border-bottom:1px solid #ddd">${escapeHtml(FIELD_LABELS[key])}</th><td style="padding:10px;border-bottom:1px solid #ddd;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join("");

  try {
    const { data, error } = await new Resend(resendApiKey).emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `DFB inquiry — ${TYPE_LABELS[inquiryType]}`,
      text,
      html: `<main style="font-family:Arial,sans-serif;max-width:760px"><h1>New DFB Solutions inquiry</h1><p><strong>${escapeHtml(TYPE_LABELS[inquiryType])}</strong></p><table style="width:100%;border-collapse:collapse">${htmlRows}</table></main>`,
    });
    if (error) throw new Error(error.message);
    console.info("DFB inquiry accepted for delivery.", { id: data?.id, inquiryType });
    return res.status(200).json({ success: true, message: "Request delivered." });
  } catch (error) {
    console.error("DFB inquiry delivery failed.", { message: error?.message, inquiryType });
    return res.status(500).json({ success: false, message: "Your request could not be delivered. Please try again." });
  }
}

function clean(value, limit) {
  return typeof value === "string" ? value.trim().slice(0, limit) : typeof value === "number" ? String(value) : "";
}

function safeParse(value) {
  try { return JSON.parse(value); } catch { return null; }
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
