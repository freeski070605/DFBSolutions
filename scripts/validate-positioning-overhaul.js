import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { servicePages } from "../src/data/servicePages.js";

const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");
const [app, contact, contactApi, api, admin, navbar, footer, css, db] = await Promise.all([
  read("src/App.jsx"), read("src/pages/ContactPage.jsx"), read("server/api/contact.js"), read("api/index.js"),
  read("src/pages/AdminPage.jsx"), read("src/components/Navbar.jsx"), read("src/components/Footer.jsx"), read("src/index.css"), read("server/api/_lib/db.js"),
]);

assert.equal(servicePages.length, 10, "Ten reusable public service configurations are required.");
assert.equal(new Set(servicePages.map((item) => item.slug)).size, servicePages.length, "Service slugs must be unique.");
for (const service of servicePages) {
  assert.match(service.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  for (const key of ["headline", "intro", "ctaLabel", "seoTitle", "seoDescription"]) assert.ok(service[key], service.slug + " is missing " + key);
  assert.ok(Array.isArray(service.process) && service.process.length >= 4, service.slug + " needs a complete process.");
  assert.ok(Array.isArray(service.faqs) && service.faqs.length, service.slug + " needs FAQs.");
}
for (const route of ["photography", "videography", "weddings", "events", "sports-media", "music-videos", "brand-content", "websites", "apps", "branding"]) {
  assert.ok(app.includes('path="/' + route + '"'), "Missing public route /" + route);
}
for (const service of ["photography", "videography", "photo-video", "website", "app", "branding", "content", "transportation", "property", "unsure"]) {
  assert.ok(contact.includes('"' + service + '"'), "Contact intake is missing " + service);
  assert.ok(contactApi.includes(service + ":" ) || contactApi.includes('"' + service + '":'), "Contact API is missing " + service);
}
assert.match(contact, /Step 4|step === 4/);
assert.match(contact, /uploadAttachments/);
assert.match(contactApi, /verifyInquiryUpload/);
assert.match(contactApi, /HeadObjectCommand/);
assert.match(api, /"admin\/services"/);
assert.match(api, /"admin\/testimonials"/);
assert.match(api, /"admin\/site-content"/);
assert.match(api, /"admin\/inquiry-attachment"/);
assert.match(admin, /label: "Services"/);
assert.match(admin, /label: "Testimonials"/);
assert.match(admin, /label: "Site Content"/);
assert.match(navbar, /Photo & Video/);
assert.match(navbar, /Client Gallery/);
assert.match(footer, /to="\/gallery"/);
assert.match(css, /@media \(max-width: 760px\)/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /\.mobile-sticky-cta/);
assert.match(db, /\["services", \{ slug: 1 \}, \{ unique: true \}\]/);
console.log("DFB positioning, service architecture, intake, admin, and route validation passed.");
