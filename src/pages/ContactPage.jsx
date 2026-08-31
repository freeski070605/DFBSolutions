import { ArrowLeft, ArrowRight, CheckCircle2, FileUp, Send, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Seo from "../components/Seo.jsx";

const services = [
  ["photography", "Photography", "Sessions, events, weddings, athletes, brands, and products"],
  ["videography", "Videography", "Films, recaps, music videos, highlights, and promotion"],
  ["photo-video", "Photography + Videography", "Combined coverage planned as one experience"],
  ["website", "Website / Landing Page", "New sites, redesigns, booking, portfolios, and commerce"],
  ["app", "App / Digital Tool", "Apps, portals, systems, dashboards, and automation"],
  ["branding", "Branding / Graphic Design", "Logos, brand kits, flyers, and visual assets"],
  ["content", "Social Media / Content", "Short-form video, branded visuals, and content packages"],
  ["transportation", "Transportation", "Private groups, events, trips, and itineraries"],
  ["property", "Property Project", "Contained improvements, repair, assembly, and installation"],
  ["unsure", "Something Else / Not Sure", "Start with the problem and DFB will identify the path"],
];
const subtypeOptions = {
  photography: ["Wedding", "Birthday / Event", "Prom", "Portrait Session", "Family", "Sports / Athlete", "Brand / Business", "Product", "Other Photography"],
  videography: ["Event Recap", "Wedding Film", "Music Video", "Sports Highlight", "Promotional / Commercial", "Brand Film", "Social Media Content", "Other Video"],
  "photo-video": ["Wedding", "Birthday / Event", "Prom", "Sports / Athlete", "Brand / Business", "Other Combined Coverage"],
  website: ["New Website", "Website Redesign", "Landing Page", "Booking Site", "E-commerce", "Artist / Portfolio Site", "Other Website"],
  app: ["New App", "Booking System", "Customer Portal", "Internal Business Tool", "Workflow System", "Automation", "Existing Platform Improvement", "Other Digital Tool"],
  branding: ["Logo", "Flyer", "Brand Kit", "Business Cards", "Social Graphics", "Event Graphics", "Promotional Materials", "Multiple Items", "Other Design"],
  content: ["Short-form Video", "Reels / TikTok Content", "Social Content Package", "Promotional Content", "Branded Visuals", "Content Strategy / Workflow"],
  transportation: ["Wedding / Prom", "Event Transportation", "Concert", "Day Trip", "Private Group", "Multi-stop Itinerary", "Other Trip"],
  property: ["Deck Platform", "Drywall Repair", "Assembly", "Installation", "Small Improvement", "Contained Custom Project", "Other Property Project"],
  unsure: ["Not Sure Yet", "Other Request"],
};
const budgets = ["Under $1,500", "$1,500–$5,000", "$5,000–$10,000", "$10,000+", "Not sure yet"];
const fieldSets = {
  photography: [["eventDate", "Event / session date", "date", true], ["location", "Location"], ["duration", "Coverage duration"], ["participants", "Guests / participants", "number"], ["deliverables", "Desired deliverables"], ["projectGoal", "What matters most?", "textarea", true], ["deadline", "Needed-by date", "date"], ["budget", "Budget range", "select", false, budgets]],
  videography: [["eventDate", "Shoot date", "date", true], ["location", "Location"], ["duration", "Shoot duration"], ["finishedLength", "Finished video length"], ["format", "Format", "select", false, ["Vertical", "Horizontal", "Both", "Not sure"]], ["projectGoal", "Concept and project details", "textarea", true], ["inspirationLink", "Inspiration link"], ["deadline", "Deadline", "date"], ["budget", "Budget range", "select", false, budgets]],
  "photo-video": [["eventDate", "Coverage date", "date", true], ["location", "Location"], ["duration", "Coverage duration"], ["participants", "Guests / participants", "number"], ["deliverables", "Photo and video deliverables"], ["projectGoal", "Combined coverage priorities", "textarea", true], ["budget", "Budget range", "select", false, budgets]],
  website: [["businessName", "Business / project name"], ["existingLink", "Existing website"], ["projectGoal", "What should the website accomplish?", "textarea", true], ["pages", "Desired pages"], ["features", "Features / customer actions", "textarea"], ["inspirationLink", "Example links"], ["deadline", "Desired launch date", "date"], ["budget", "Budget range", "select", true, budgets]],
  app: [["businessName", "Business / project name"], ["projectGoal", "What problem should this solve?", "textarea", true], ["audience", "Who will use it?"], ["features", "Most important features", "textarea"], ["existingLink", "Existing system"], ["timeline", "Desired timeline"], ["budget", "Budget range", "select", true, budgets]],
  branding: [["businessName", "Business / event name"], ["existingBrand", "Existing logo / brand?", "select", false, ["Yes", "No", "Partially"]], ["projectGoal", "Context and visual direction", "textarea", true], ["deliverables", "Assets needed"], ["deadline", "Needed-by date", "date"], ["budget", "Budget range", "select", false, budgets]],
  content: [["businessName", "Business / creator name"], ["projectGoal", "What should the content accomplish?", "textarea", true], ["platforms", "Primary platforms"], ["deliverables", "Content volume / deliverables"], ["eventDate", "Preferred shoot date", "date"], ["deadline", "Campaign deadline", "date"], ["budget", "Budget range", "select", false, budgets]],
  transportation: [["eventDate", "Trip / event date", "date", true], ["pickupCity", "Pickup location / city", "text", true], ["destination", "Destination / route", "text", true], ["stops", "Stops / multi-stop details"], ["passengers", "Passengers", "number", true], ["duration", "Expected duration"], ["itineraryFinal", "Itinerary finalized?", "select", true, ["Yes", "No", "Partially"]], ["specialRequests", "Special requests", "textarea"]],
  property: [["location", "Project city / ZIP", "text", true], ["projectGoal", "Describe the project or issue", "textarea", true], ["timeline", "Preferred timeline"], ["specialRequests", "Special considerations", "textarea"]],
  unsure: [["projectGoal", "What is happening and what should be better?", "textarea", true], ["timeline", "Date or timeline"], ["budget", "Budget range"]],
};
const legacyMap = { creative: "photo-video", digital: "website", property: "property", transportation: "transportation", unsure: "unsure" };
const allowedFiles = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".doc", ".docx"];
const dateSensitive = new Set(["photography", "videography", "photo-video", "transportation"]);

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const queryService = searchParams.get("service") || legacyMap[searchParams.get("type")] || "";
  const initialService = services.some(([key]) => key === queryService) ? queryService : "";
  const [step, setStep] = useState(initialService ? 2 : 1);
  const [form, setForm] = useState({ serviceCategory: initialService, projectSubtype: normalizeSubtype(initialService, searchParams.get("subtype") || searchParams.get("detail")), companyWebsite: "" });
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const fields = useMemo(() => fieldSets[form.serviceCategory] || [], [form.serviceCategory]);
  const serviceLabel = services.find(([key]) => key === form.serviceCategory)?.[1] || "";
  const cta = ({ photography: "Request Photography Quote", videography: "Request Video Quote", "photo-video": "Check Combined Coverage", website: "Start My Website", app: "Start My Build", branding: "Start My Design", content: "Plan My Content", transportation: "Request Trip Quote", property: "Request Project Estimate", unsure: "Send My Request" })[form.serviceCategory];
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  function chooseService(key) { setForm((current) => ({ ...current, serviceCategory: key, projectSubtype: "" })); setStep(2); }
  function addFiles(event) {
    const selected = Array.from(event.target.files || []);
    const invalid = selected.find((file) => file.size > 10 * 1024 * 1024 || !allowedFiles.some((extension) => file.name.toLowerCase().endsWith(extension)));
    if (invalid) { setMessage("Files must be JPG, PNG, WebP, PDF, DOC, or DOCX and no larger than 10 MB."); setStatus("error"); return; }
    setFiles((current) => [...current, ...selected].slice(0, 5)); setMessage(""); setStatus("idle"); event.target.value = "";
  }
  function validateCurrent() {
    if (step === 2) {
      if (!form.projectSubtype) return "Choose the closest project type.";
      const missing = fields.find(([name,, , required]) => required && !String(form[name] || "").trim());
      return missing ? missing[1] + " is required." : "";
    }
    if (step === 3) {
      if (!form.name?.trim()) return "Name is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || "")) return "Enter a valid email address.";
    }
    return "";
  }
  function next() { const error = validateCurrent(); if (error) { setStatus("error"); setMessage(error); return; } setStatus("idle"); setMessage(""); setStep((value) => Math.min(4, value + 1)); }
  async function submit(event) {
    event.preventDefault(); setStatus("loading"); setMessage("");
    try {
      const attachments = files.length ? await uploadAttachments(files) : [];
      const details = Object.fromEntries(Object.entries(form).filter(([key, value]) => value && !["serviceCategory", "projectSubtype", "name", "email", "phone", "companyWebsite"].includes(key)));
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ serviceCategory: form.serviceCategory, serviceType: serviceLabel, projectSubtype: form.projectSubtype, name: form.name, email: form.email, phone: form.phone, eventDate: form.eventDate, location: form.location || form.pickupCity, budget: form.budget, details, attachments, companyWebsite: form.companyWebsite }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || "Your request could not be sent.");
      setStatus("success");
    } catch (error) { setStatus("error"); setMessage(error.message || "Something went wrong. Please try again."); }
  }
  return <main id="top" className="guided-contact">
    <Seo title="Book / Get a Quote" description="Choose photography, videography, websites, apps, branding, content, transportation, or property work and send DFB a guided inquiry." />
    <section className="page-hero contact-hero section"><div><p className="eyebrow">Book / Get a Quote</p><h1>Tell us what you need.<br /><em>We’ll make the next step clear.</em></h1><p>Submitting checks availability and scope. It does not confirm a booking.</p></div><div className="contact-note"><strong>Date-sensitive project?</strong><p>Share the date early. DFB reviews availability before an agreement or deposit is requested.</p></div></section>
    <section className="section guided-intake">
      <ol className="intake-progress" aria-label="Inquiry progress">{["Service", "Project details", "Contact", "Review"].map((label, index) => <li key={label} className={step === index + 1 ? "active" : step > index + 1 ? "complete" : ""}><span>{step > index + 1 ? "✓" : index + 1}</span>{label}</li>)}</ol>
      {status === "success" ? <Confirmation needsDate={dateSensitive.has(form.serviceCategory)} onReset={() => { setForm({ serviceCategory: "", projectSubtype: "", companyWebsite: "" }); setFiles([]); setStep(1); setStatus("idle"); }} /> :
      <form className="guided-form" onSubmit={submit}>
        {step === 1 && <div className="intake-step"><Heading step="1" title="What service are you looking for?" /><div className="service-choice-grid">{services.map(([key, label, copy]) => <button key={key} type="button" className={form.serviceCategory === key ? "active" : ""} onClick={() => chooseService(key)}><strong>{label}</strong><small>{copy}</small><ArrowRight /></button>)}</div></div>}
        {step === 2 && <div className="intake-step"><Heading step={"2 / " + serviceLabel} title={form.serviceCategory === "photography" ? "What are we photographing?" : form.serviceCategory === "videography" ? "What type of video do you need?" : "Tell us about the project."} /><div className="subtype-grid">{subtypeOptions[form.serviceCategory].map((item) => <button type="button" key={item} aria-pressed={form.projectSubtype === item} className={form.projectSubtype === item ? "active" : ""} onClick={() => setForm({ ...form, projectSubtype: item })}>{item}</button>)}</div><div className="form-grid dynamic-fields">{fields.map(([name, label, kind = "text", required = false, options]) => <Field key={name} name={name} label={label} type={kind} required={required} options={options} value={form[name] || ""} onChange={update} />)}<UploadField files={files} addFiles={addFiles} remove={(index) => setFiles(files.filter((_, itemIndex) => itemIndex !== index))} /></div></div>}
        {step === 3 && <div className="intake-step narrow-step"><Heading step="3" title="How should DFB reach you?" /><div className="form-grid"><Field name="name" label="Name" required value={form.name || ""} onChange={update} /><Field name="email" label="Email" type="email" required value={form.email || ""} onChange={update} /><Field name="phone" label="Phone" type="tel" value={form.phone || ""} onChange={update} /></div><input className="honeypot" name="companyWebsite" tabIndex="-1" autoComplete="off" value={form.companyWebsite} onChange={update} aria-hidden="true" /></div>}
        {step === 4 && <div className="intake-step review-step"><Heading step="4" title="Review your request." /><dl><Review label="Service" value={serviceLabel} /><Review label="Project type" value={form.projectSubtype} />{fields.map(([name, label]) => form[name] ? <Review key={name} label={label} value={form[name]} /> : null)}<Review label="Contact" value={[form.name, form.email, form.phone].filter(Boolean).join(" · ")} />{files.length > 0 && <Review label="Attachments" value={files.map((file) => file.name).join(", ")} />}</dl><p className="privacy-note">Your information and private attachments are used only to review and respond to this inquiry.</p></div>}
        {status === "error" && <p className="form-error" role="alert">{message}</p>}
        {step > 1 && <div className="step-actions"><button type="button" className="btn btn-secondary" onClick={() => { setStep(step - 1); setStatus("idle"); }}><ArrowLeft size={16} /> Back</button>{step < 4 ? <button type="button" className="btn btn-primary" onClick={next}>Continue <ArrowRight size={16} /></button> : <button className="btn btn-primary" disabled={status === "loading"}>{status === "loading" ? "Sending…" : <>{cta} <Send size={16} /></>}</button>}</div>}
      </form>}
    </section>
  </main>;
}

function Heading({ step, title }) { return <div className="form-heading"><p className="eyebrow">Step {step} of 4</p><h2>{title}</h2></div>; }
function Field({ label, name, type = "text", options = [], ...props }) { return <label className={type === "textarea" ? "full-field" : ""}><span>{label}{props.required && <i>Required</i>}</span>{type === "textarea" ? <textarea name={name} rows="5" maxLength="3000" {...props} /> : type === "select" ? <select name={name} {...props}><option value="">Select one</option>{options.map((item) => <option key={item}>{item}</option>)}</select> : <input name={name} type={type} min={type === "date" ? new Date().toISOString().slice(0, 10) : undefined} maxLength={type === "number" ? undefined : 500} {...props} />}</label>; }
function UploadField({ files, addFiles, remove }) { return <div className="upload-field full-field"><span>Optional references / files <small>JPG, PNG, WebP, PDF, DOC, DOCX · 10 MB each · up to 5</small></span><label><FileUp /><strong>Add files</strong><input type="file" multiple accept={allowedFiles.join(",")} onChange={addFiles} /></label>{files.length > 0 && <ul>{files.map((file, index) => <li key={file.name + file.size}>{file.name}<button type="button" aria-label={"Remove " + file.name} onClick={() => remove(index)}><X size={14} /></button></li>)}</ul>}</div>; }
function Review({ label, value }) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }
function Confirmation({ needsDate, onReset }) { return <div className="inquiry-confirmation" role="status"><CheckCircle2 /><p className="eyebrow">Request received</p><h2>{needsDate ? "Your date is being reviewed." : "Your project is on our radar."}</h2><ol>{[["Request received", "Your details are safely attached to a categorized inquiry."], ["Availability and scope review", "DFB checks the date, service, requirements, and references."], ["Follow-up", "You receive availability, useful questions, or a recommended next step."], ["Quote and agreement", "A tailored quote and agreement are provided when scope is clear."], ["Booking", "For date-sensitive work, the agreement and deposit secure the date."]].map(([title, copy], index) => <li key={title}><span>{index + 1}</span><div><strong>{title}</strong><p>{copy}</p></div></li>)}</ol><button className="btn btn-secondary" type="button" onClick={onReset}>Send another request</button></div>; }
function normalizeSubtype(service, value) { if (!value) return ""; const normalized = value.replaceAll("-", " ").toLowerCase(); return (subtypeOptions[service] || []).find((option) => option.toLowerCase().includes(normalized) || normalized.includes(option.toLowerCase().split(" / ")[0])) || ""; }
async function uploadAttachments(files) {
  return Promise.all(files.map(async (file) => {
    const response = await fetch("/api/contact-uploads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "prepare", name: file.name, type: file.type, size: file.size }) });
    const data = await response.json(); if (!response.ok || !data.success) throw new Error(data.message || "A file could not be prepared.");
    const upload = await fetch(data.uploadUrl, { method: "PUT", headers: { "Content-Type": data.contentType }, body: file }); if (!upload.ok) throw new Error("A file upload failed. Please retry.");
    return { token: data.token, name: file.name, type: data.contentType, size: file.size };
  }));
}
