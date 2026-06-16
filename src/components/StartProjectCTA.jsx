import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Video, Wrench } from "lucide-react";
import SectionHeader from "./SectionHeader.jsx";

const projectTypes = [
  "Photography / Visual Media",
  "Branding / Content",
  "Website / Landing Page",
  "App / Digital Tool",
  "Music / Media",
  "AI Workflow",
  "Other",
];

const initialFormState = (projectType = projectTypes[0]) => ({
  name: "",
  email: "",
  need: "",
  projectType,
  budget: "",
  timeline: "",
  message: "",
  companyWebsite: "",
});

export default function StartProjectCTA() {
  const [form, setForm] = useState(() => initialFormState());
  const [status, setStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    function applyProjectTypeFromHash() {
      const hash = window.location.hash;
      const [, queryString] = hash.split("?");

      if (!queryString) {
        return;
      }

      const requestedType = new URLSearchParams(queryString).get("projectType");

      if (projectTypes.includes(requestedType)) {
        setForm((current) => ({
          ...current,
          projectType: requestedType,
        }));
      }
    }

    applyProjectTypeFromHash();
    window.addEventListener("hashchange", applyProjectTypeFromHash);

    return () => {
      window.removeEventListener("hashchange", applyProjectTypeFromHash);
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setStatusMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success !== true) {
        throw new Error(result?.message || "Project request could not be sent. Please try again.");
      }

      setStatus("success");
      setStatusMessage(result.message || "Project request sent successfully.");
      setForm(initialFormState(form.projectType));
    } catch (error) {
      setStatus("error");
      setStatusMessage(error.message || "Project request could not be sent. Please try again.");
    }
  }

  const isSubmitting = status === "submitting";

  return (
    <section id="start-project" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <SectionHeader
              eyebrow="Start Project"
              title="Got An Idea Sitting In Your Notes?"
              subtitle="Bring the rough version. DFB helps shape it, brand it, build it, capture it, and turn it into something people can see, use, stream, book, or buy."
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href="#start-project" className="btn-primary">
                <Sparkles size={18} aria-hidden="true" />
                Start A Project
              </a>
              <a href="#media" className="btn-secondary">
                <Video size={18} aria-hidden="true" />
                Book Visual Work
              </a>
              <a href="#featured-builds" className="btn-ghost">
                <Wrench size={18} aria-hidden="true" />
                Explore Builds
              </a>
            </div>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            className="glass-panel grid gap-4 p-4 sm:p-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55 }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Name"
                name="name"
                autoComplete="name"
                maxLength={120}
                onChange={handleChange}
                required
                value={form.name}
              />
              <Field
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={200}
                onChange={handleChange}
                required
                value={form.email}
              />
            </div>
            <Field
              label="What do you need?"
              name="need"
              maxLength={300}
              onChange={handleChange}
              value={form.need}
            />
            <label className="field-label">
              Project type
              <select
                name="projectType"
                className="field-control"
                onChange={handleChange}
                required
                value={form.projectType}
              >
                {projectTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Budget range"
                name="budget"
                maxLength={100}
                onChange={handleChange}
                value={form.budget}
              />
              <Field
                label="Timeline"
                name="timeline"
                maxLength={100}
                onChange={handleChange}
                value={form.timeline}
              />
            </div>
            <label className="field-label">
              Message
              <textarea
                name="message"
                rows="5"
                className="field-control resize-none"
                maxLength={3000}
                onChange={handleChange}
                required
                value={form.message}
              />
            </label>
            <input
              type="text"
              name="companyWebsite"
              tabIndex={-1}
              autoComplete="off"
              value={form.companyWebsite}
              onChange={handleChange}
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-9999px",
                opacity: 0,
                height: 0,
                width: 0,
              }}
            />
            <button type="submit" className="btn-primary justify-center" disabled={isSubmitting}>
              <Send size={18} aria-hidden="true" />
              {isSubmitting ? "Sending..." : "Send Project Signal"}
            </button>
            {statusMessage && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={
                  status === "success"
                    ? "border border-signal/40 bg-signal/10 px-4 py-3 text-sm font-bold text-emerald-100"
                    : "border border-heat/45 bg-heat/10 px-4 py-3 text-sm font-bold text-orange-100"
                }
                role={status === "success" ? "status" : "alert"}
              >
                {statusMessage}
              </motion.p>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, type = "text", ...props }) {
  return (
    <label className="field-label">
      {label}
      <input name={name} type={type} className="field-control" {...props} />
    </label>
  );
}
