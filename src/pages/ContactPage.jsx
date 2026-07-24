import { ArrowRight, CheckCircle2, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { useDivisions } from "../context/DivisionsContext.jsx";

const types = [
  ["digital", "Digital project"],
  ["creative", "Creative project"],
  ["property", "Property project"],
  ["transportation", "Transportation request"],
  ["unsure", "Not sure yet"],
];

const fieldSets = {
  digital: [
    ["businessName", "Business or project name"],
    ["projectGoal", "What are you trying to build or improve?", "textarea", true],
    ["audience", "Who is it for?"],
    ["timeline", "Desired timeline"],
    ["budget", "Estimated budget range", "select", true, ["Under $1,500", "$1,500–$5,000", "$5,000–$10,000", "$10,000+", "Not sure yet"]],
    ["existingLink", "Existing website or platform"],
  ],
  creative: [
    ["projectKind", "Event or project type", "text", true],
    ["eventDate", "Date", "date", true],
    ["location", "Location"],
    ["coverage", "Photography, video, or both", "select", true, ["Photography", "Video", "Photography and video", "Not sure yet"]],
    ["duration", "Estimated duration"],
    ["projectGoal", "Tell us about the project", "textarea", true],
    ["deliverables", "Desired deliverables"],
    ["budget", "Estimated budget range"],
  ],
  property: [
    ["projectKind", "Project type", "text", true],
    ["location", "Property city / ZIP", "text", true],
    ["projectGoal", "Describe the issue or desired work", "textarea", true],
    ["timeline", "Preferred timeline"],
    ["referenceLink", "Link to project photos, if available"],
  ],
  transportation: [
    ["projectKind", "Trip or event type", "text", true],
    ["eventDate", "Date", "date", true],
    ["pickupCity", "Pickup city", "text", true],
    ["destination", "Destination or route", "text", true],
    ["passengers", "Number of passengers", "number", true],
    ["stops", "Number of stops", "number"],
    ["duration", "Expected duration"],
    ["specialRequests", "Special requests", "textarea"],
    ["itineraryFinal", "Is the itinerary finalized?", "select", true, ["Yes", "No", "Partially"]],
  ],
  unsure: [
    ["projectGoal", "Tell us what is happening and what should be better", "textarea", true],
    ["timeline", "Is there a date or timeline to keep in mind?"],
    ["budget", "Do you have a budget range in mind?"],
  ],
};

export default function ContactPage() {
  const { divisions } = useDivisions();
  const [searchParams] = useSearchParams();
  const initialType = types.some(([key]) => key === searchParams.get("type")) ? searchParams.get("type") : "";
  const [type, setType] = useState(initialType);
  const [form, setForm] = useState({ detail: searchParams.get("detail") || "", companyWebsite: "" });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const fields = useMemo(() => fieldSets[type] || [], [type]);
  const division = divisions.find((item) => item.slug === type);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, inquiryType: type }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || "Your request could not be sent.");
      setStatus("success");
      setMessage("Thank you. Your request has been delivered to DFB Solutions.");
      setForm({ companyWebsite: "" });
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <main id="top" style={{ "--page-accent": division?.accent || "#cfff45" }}>
      <Seo title="Contact" description="Tell DFB Solutions what you are trying to solve. Start a tailored inquiry for digital, creative, property, or transportation work." />
      <section className="page-hero contact-hero section">
        <div><p className="eyebrow">Start a conversation</p><h1>What can we help<br /><em>you solve?</em></h1><p>You do not need a perfect brief. Choose the closest path and tell us what you know.</p></div>
        <div className="contact-note"><strong>What happens next?</strong><p>DFB reviews the need, asks any useful follow-up questions, and determines whether there is a clear path forward.</p></div>
      </section>
      <section className="section intake-section">
        <div className="type-chooser">
          <p className="eyebrow">01 / Choose a request</p>
          {types.map(([key, label]) => <button key={key} type="button" className={type === key ? "active" : ""} aria-pressed={type === key} onClick={() => { setType(key); setStatus("idle"); }}><span>{label}</span><ArrowRight size={17} /></button>)}
        </div>
        <div className="form-panel">
          {!type ? <div className="form-awaiting"><span>01</span><h2>Start by choosing the kind of help you need.</h2><p>If none feel exact, choose “Not sure yet.” The problem matters more than the label.</p></div> :
          status === "success" ? <div className="form-success" role="status"><CheckCircle2 size={44} /><p className="eyebrow">Request received</p><h2>Your problem is now on our radar.</h2><p>{message}</p><button className="btn btn-secondary" type="button" onClick={() => setStatus("idle")}>Send another request</button></div> :
          <form onSubmit={submit}>
            <div className="form-heading"><p className="eyebrow">02 / Tell us what you know</p><h2>{types.find(([key]) => key === type)?.[1]}</h2>{form.detail && <span>Starting point: {form.detail}</span>}</div>
            <div className="form-grid">
              <Field name="name" label="Name" required value={form.name || ""} onChange={update} />
              <Field name="email" label="Email" type="email" required value={form.email || ""} onChange={update} />
              <Field name="phone" label="Phone" type="tel" value={form.phone || ""} onChange={update} />
              {fields.map(([name, label, kind = "text", required = false, options]) => <Field key={name} name={name} label={label} type={kind} required={required} options={options} value={form[name] || ""} onChange={update} />)}
            </div>
            <input className="honeypot" type="text" name="companyWebsite" tabIndex="-1" autoComplete="off" value={form.companyWebsite || ""} onChange={update} aria-hidden="true" />
            <p className="privacy-note">Your information is used only to review and respond to this request. Property addresses are not requested at this stage.</p>
            <button className="btn btn-primary submit-button" type="submit" disabled={status === "loading"}>{status === "loading" ? "Sending request…" : <>Send request <Send size={16} /></>}</button>
            {status === "error" && <p className="form-error" role="alert">{message}</p>}
          </form>}
        </div>
      </section>
    </main>
  );
}

function Field({ label, name, type = "text", options, ...props }) {
  const className = type === "textarea" ? "field full-field" : "";
  return (
    <label className={className}>
      <span>{label}{props.required && <i>Required</i>}</span>
      {type === "textarea" ? <textarea name={name} rows="5" maxLength="3000" {...props} /> :
        type === "select" ? <select name={name} {...props}><option value="">Select one</option>{options.map((item) => <option key={item}>{item}</option>)}</select> :
        <input name={name} type={type} maxLength={type === "number" ? undefined : 500} min={type === "number" ? 0 : undefined} {...props} />}
    </label>
  );
}
