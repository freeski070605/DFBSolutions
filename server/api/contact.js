import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { Resend } from "resend";
import { getDb } from "./_lib/db.js";
import { allowedOrigin, parseBody, sanitizeObject } from "./_lib/http.js";
import { MAX_INQUIRY_FILES, verifyInquiryUpload } from "./_lib/inquiryUploads.js";
import { getR2BucketName, getR2Client } from "./_lib/r2.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SERVICE_LABELS = {
  photography: "Photography", videography: "Videography", "photo-video": "Photography + Videography",
  website: "Website / Landing Page", app: "App / Digital Tool", branding: "Branding / Graphic Design",
  content: "Social Media / Content", transportation: "Transportation", property: "Property Project", unsure: "Something Else / Not Sure",
  digital: "Digital project", creative: "Creative project",
};
const REQUIRED = {
  photography: ["eventDate", "projectGoal"], videography: ["eventDate", "projectGoal"], "photo-video": ["eventDate", "projectGoal"],
  website: ["projectGoal", "budget"], app: ["projectGoal", "budget"], branding: ["projectGoal"], content: ["projectGoal"],
  transportation: ["eventDate", "pickupCity", "destination", "passengers", "itineraryFinal"], property: ["location", "projectGoal"], unsure: ["projectGoal"],
  digital: ["projectGoal", "budget"], creative: ["eventDate", "projectGoal"],
};

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ success: false, message: "Method not allowed." }); }
  if (!allowedOrigin(req)) return res.status(403).json({ success: false, message: "Origin not allowed." });
  const body = parseBody(req);
  if (!body || typeof body !== "object" || Array.isArray(body)) return res.status(400).json({ success: false, message: "Please submit a valid request." });
  if (clean(body.companyWebsite, 200)) return res.status(200).json({ success: true, message: "Request received." });

  const legacyType = clean(body.inquiryType, 50);
  const serviceCategory = clean(body.serviceCategory, 50) || legacyType;
  const serviceType = clean(body.serviceType, 120) || SERVICE_LABELS[serviceCategory];
  const projectSubtype = clean(body.projectSubtype, 120) || clean(body.projectKind, 120) || clean(body.detail, 120);
  const name = clean(body.name, 120), email = clean(body.email, 200), phone = clean(body.phone, 50);
  if (!SERVICE_LABELS[serviceCategory]) return res.status(400).json({ success: false, message: "Please choose a service." });
  if (!name) return res.status(400).json({ success: false, message: "Name is required." });
  if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ success: false, message: "Please enter a valid email address." });

  const details = Object.keys(body.details || {}).length ? sanitizeObject(body.details) : legacyDetails(body);
  for (const field of REQUIRED[serviceCategory] || []) {
    const value = details[field] ?? body[field];
    if (!clean(value, 3000)) return res.status(400).json({ success: false, message: humanize(field) + " is required." });
  }
  const attachments = await resolveAttachments(body.attachments);
  if (attachments.error) return res.status(400).json({ success: false, message: attachments.error });

  const now = new Date();
  let inquiryId;
  try {
    const db = await getDb();
    const result = await db.collection("inquiries").insertOne({
      serviceCategory, serviceType, projectSubtype, inquiryType: legacyType || legacyCategory(serviceCategory),
      status: "new", name, email, phone, eventDate: clean(body.eventDate, 50) || clean(details.eventDate, 50),
      location: clean(body.location, 300) || clean(details.location, 300) || clean(details.pickupCity, 300),
      budget: clean(body.budget, 120) || clean(details.budget, 120), details, attachments: attachments.items,
      source: clean(body.source, 80) || "website", notes: "", createdAt: now, updatedAt: now,
    });
    inquiryId = result.insertedId;
  } catch (error) {
    console.error("Contact inquiry persistence failed.", { message: error?.message, serviceCategory });
    return res.status(503).json({ success: false, message: "Your request could not be saved. Please try again." });
  }

  const label = projectSubtype ? projectSubtype + " — " + serviceType : serviceType || SERVICE_LABELS[serviceCategory];
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO_EMAIL || !process.env.CONTACT_FROM_EMAIL) return res.status(201).json({ success: true, message: "Request saved." });
  const rows = { Name: name, Email: email, Phone: phone, Service: serviceType, "Project type": projectSubtype, ...details, Attachments: attachments.items.length ? attachments.items.map((item) => item.name).join(", ") : "" };
  const text = ["New DFB Inquiry — " + label, "", ...Object.entries(rows).filter(([, value]) => value).map(([key, value]) => humanize(key) + ": " + value), "Submitted: " + now.toISOString()].join("\n");
  const htmlRows = Object.entries(rows).filter(([, value]) => value).map(([key, value]) => '<tr><th style="padding:10px;text-align:left;border-bottom:1px solid #ddd">' + escapeHtml(humanize(key)) + '</th><td style="padding:10px;border-bottom:1px solid #ddd">' + escapeHtml(value) + "</td></tr>").join("");
  try {
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({ from: process.env.CONTACT_FROM_EMAIL, to: process.env.CONTACT_TO_EMAIL, replyTo: email, subject: "New DFB Inquiry — " + label, text, html: '<main style="font-family:Arial,sans-serif;max-width:760px"><h1>New DFB Inquiry — ' + escapeHtml(label) + '</h1><table style="width:100%;border-collapse:collapse">' + htmlRows + "</table><p>Private attachments are available in DFB Admin.</p></main>" });
    if (error) throw new Error(error.message);
    await (await getDb()).collection("inquiries").updateOne({ _id: inquiryId }, { $set: { emailDeliveredAt: new Date() } });
  } catch (error) { console.error("Inquiry saved, but email delivery failed.", { message: error?.message, inquiryId }); }
  return res.status(201).json({ success: true, message: "Request saved." });
}

async function resolveAttachments(input) {
  if (!Array.isArray(input) || !input.length) return { items: [] };
  if (input.length > MAX_INQUIRY_FILES) return { error: "No more than five attachments are allowed." };
  const items = [];
  for (const item of input) {
    const payload = verifyInquiryUpload(item?.token);
    if (!payload || payload.name !== item.name || payload.type !== item.type || payload.size !== item.size) return { error: "An attachment could not be verified. Please upload it again." };
    try {
      const head = await getR2Client().send(new HeadObjectCommand({ Bucket: getR2BucketName(), Key: payload.key }));
      if (Number(head.ContentLength) !== payload.size || head.ContentType !== payload.type) return { error: "An uploaded file did not pass validation." };
    } catch { return { error: "An uploaded file could not be found. Please upload it again." }; }
    items.push({ key: payload.key, name: payload.name, type: payload.type, size: payload.size, private: true });
  }
  return { items };
}
function legacyDetails(body) {
  const excluded = new Set(["serviceCategory", "serviceType", "projectSubtype", "inquiryType", "name", "email", "phone", "attachments", "companyWebsite"]);
  return sanitizeObject(Object.fromEntries(Object.entries(body).filter(([key]) => !excluded.has(key))));
}
function legacyCategory(service) { return ["photography", "videography", "photo-video", "content"].includes(service) ? "creative" : ["website", "app", "branding"].includes(service) ? "digital" : service; }
function clean(value, limit) { return typeof value === "string" ? value.trim().slice(0, limit) : typeof value === "number" ? String(value) : ""; }
function humanize(value) { return String(value).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase()); }
function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
