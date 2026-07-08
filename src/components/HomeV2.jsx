import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  Send,
  Sparkles,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  audiences,
  budgetOptions,
  heroSignals,
  offers,
  processSteps,
  projects,
  projectTypeOptions,
  proofStats,
  services,
} from "../data/siteContent.js";
import SectionHeader from "./SectionHeader.jsx";
import StatusPill from "./StatusPill.jsx";

const initialFormState = (projectType = "Not sure yet") => ({
  name: "",
  email: "",
  businessName: "",
  need: "",
  projectType,
  budget: "",
  timeline: "",
  links: "",
  message: "",
  companyWebsite: "",
});

export default function HomeV2() {
  return (
    <>
      <main>
        <HeroSection />
        <ServicesSection />
        <AudienceSection />
        <PortfolioSection />
        <OffersSection />
        <ProcessSection />
        <MomentumSection />
        <AboutSection />
        <IntakeSection />
      </main>
    </>
  );
}

function HeroSection() {
  return (
    <section id="home" className="section-shell relative min-h-screen overflow-hidden pt-28 sm:pt-32">
      <div className="absolute inset-x-0 top-20 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.12),transparent_58%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <p className="mb-5 text-xs font-black uppercase tracking-[0.28em] text-signal">
            DFB Solutions
          </p>
          <h1 className="max-w-5xl break-words font-display text-[2.65rem] font-black uppercase leading-[0.96] text-white min-[420px]:text-5xl sm:text-7xl sm:leading-[0.9] lg:text-8xl">
            Stop sitting on the idea. Let&apos;s build it into something real.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-xl sm:leading-8">
            DFB Solutions helps creators, service businesses, artists, and entrepreneurs launch clean
            websites, apps, content systems, and AI-powered tools without looking basic or sounding corporate.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#start-project" className="btn-primary">
              <Sparkles size={18} aria-hidden="true" />
              Start My Build
            </a>
            <a href="#work" className="btn-secondary">
              <ArrowDown size={18} aria-hidden="true" />
              See The Work
            </a>
          </div>
          <div className="mt-8 grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
            {proofStats.map(([value, label]) => (
              <div key={value} className="border border-white/10 bg-white/[0.045] p-3 backdrop-blur">
                <p className="font-display text-xl font-black uppercase text-white">{value}</p>
                <p className="mt-1 text-[0.68rem] font-black uppercase tracking-[0.13em] text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.1 }}
        >
          <div className="glass-panel relative overflow-hidden p-4 sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(50,255,157,.18),transparent_30%),radial-gradient(circle_at_90%_0%,rgba(53,167,255,.18),transparent_28%)]" />
            <div className="relative border border-white/10 bg-black/35 p-4">
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                  Build Board
                </span>
                <span className="border border-signal/30 bg-signal/10 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-signal">
                  Idea To Execution
                </span>
              </div>
              <div className="grid gap-3">
                {heroSignals.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      className="flex items-center justify-between gap-4 border border-white/[0.08] bg-white/[0.045] p-3"
                      animate={{ x: [0, index % 2 ? -4 : 4, 0] }}
                      transition={{ duration: 4 + index * 0.2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <span className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.12em] text-white">
                        <span className="grid h-10 w-10 place-items-center border border-voltage/35 bg-voltage/10 text-sky-100">
                          <Icon size={18} aria-hidden="true" />
                        </span>
                        {item.label}
                      </span>
                      <ChevronRight size={18} className="text-signal" aria-hidden="true" />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="What We Build"
          title="Digital products, brands, and systems that make the idea official."
          subtitle="Every build is shaped around the outcome: more trust, cleaner operations, better launches, stronger follow-up, and a sharper next step."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => (
            <ServiceOutcomeCard key={service.title} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceOutcomeCard({ service, index }) {
  const Icon = service.icon;
  const href = `#start-project?projectType=${encodeURIComponent(service.projectType)}`;

  return (
    <motion.article
      className="command-card min-h-[350px]"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.04 }}
      whileHover={{ y: -6 }}
    >
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-voltage/14 via-signal/5 to-transparent" />
      <span className="relative grid h-12 w-12 place-items-center border border-voltage/35 bg-voltage/10 text-sky-100 shadow-glow">
        <Icon size={22} aria-hidden="true" />
      </span>
      <h3 className="relative mt-5 font-display text-2xl font-black uppercase leading-none text-white">
        {service.title}
      </h3>
      <p className="relative mt-3 text-sm leading-6 text-slate-300">{service.outcome}</p>
      <div className="relative mt-5 grid gap-2">
        {service.includes.map((item) => (
          <p key={item} className="flex items-center gap-2 text-sm text-slate-300">
            <Check size={15} className="text-signal" aria-hidden="true" />
            {item}
          </p>
        ))}
      </div>
      <a href={href} className="micro-cta mt-6">
        <Send size={15} aria-hidden="true" />
        Request This
      </a>
    </motion.article>
  );
}

function AudienceSection() {
  return (
    <section id="for-who" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <SectionHeader
            eyebrow="Who It Is For"
            title="Built for people who need momentum, not corporate fog."
            subtitle="DFB speaks to real operators: people building a business, a product, a brand, a stage, or a system while life is already moving."
          />
          <div className="grid gap-3 md:grid-cols-2">
            {audiences.map((audience, index) => {
              const Icon = audience.icon;
              return (
                <motion.article
                  key={audience.title}
                  className="border border-white/[0.12] bg-white/[0.055] p-5 backdrop-blur"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                >
                  <Icon size={22} className="text-signal" aria-hidden="true" />
                  <h3 className="mt-4 font-display text-xl font-black uppercase text-white">
                    {audience.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{audience.copy}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function PortfolioSection() {
  return (
    <section id="work" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Featured Builds"
          title="Proof that DFB is more than web design."
          subtitle="A portfolio of live, internal, in-progress, and prototype builds that show the studio range: games, beauty tech, dashboards, apps, and the DFB platform itself."
          align="center"
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectV2Card key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectV2Card({ project, index }) {
  const accents = {
    signal: "border-signal/25 from-signal/[0.12]",
    voltage: "border-voltage/25 from-voltage/[0.12]",
    heat: "border-heat/25 from-heat/[0.13]",
    rose: "border-rose-300/20 from-rose-300/[0.12]",
    chrome: "border-white/20 from-white/[0.10]",
  };

  return (
    <motion.article
      className={`project-card bg-gradient-to-br ${accents[project.accent] || accents.voltage} via-white/[0.045] to-black/25 ${project.featured ? "lg:col-span-2" : ""}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -7 }}
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-signal">
            {project.category}
          </p>
          <h3 className="mt-2 font-display text-3xl font-black uppercase leading-none text-white sm:text-4xl">
            {project.title}
          </h3>
        </div>
        <StatusPill tone={project.status === "Live" ? "green" : project.status === "Prototype" ? "heat" : "blue"}>
          {project.status}
        </StatusPill>
      </div>
      <p className="text-sm leading-6 text-slate-300">{project.description}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span key={tag} className="border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-bold text-slate-300">
            {tag}
          </span>
        ))}
      </div>
      <a href={project.status === "Live" ? "#start-project" : "#work"} className="micro-cta mt-7">
        <ArrowUpRight size={16} aria-hidden="true" />
        {project.cta}
      </a>
    </motion.article>
  );
}

function OffersSection() {
  return (
    <section id="offers" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Offer Ladder"
          title="Pick the level that matches the move."
          subtitle="No fake pricing theater. Some builds are quick launches. Some are systems. The intake gets the right conversation started."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {offers.map((offer, index) => (
            <motion.article
              key={offer.title}
              className="receipt-card flex min-h-[330px] flex-col"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
            >
              <p className="text-[0.66rem] font-black uppercase tracking-[0.2em] text-signal">
                {offer.label}
              </p>
              <h3 className="mt-3 font-display text-2xl font-black uppercase leading-none text-white">
                {offer.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{offer.fit}</p>
              <div className="mt-5 grid gap-2">
                {offer.details.map((detail) => (
                  <p key={detail} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check size={15} className="mt-0.5 shrink-0 text-signal" aria-hidden="true" />
                    {detail}
                  </p>
                ))}
              </div>
              <a href="#start-project" className="micro-cta mt-auto">
                Request Quote
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section id="process" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Process"
          title="From idea to execution without endless talking."
          subtitle="The process is simple on purpose. DFB helps you identify the next real step, build it, launch it, then improve it."
          align="center"
        />
        <div className="grid gap-3 md:grid-cols-5">
          {processSteps.map((step, index) => (
            <motion.article
              key={step.title}
              className="border border-white/[0.12] bg-black/25 p-5 backdrop-blur"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
            >
              <p className="font-display text-4xl font-black uppercase text-white/15">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-4 font-display text-2xl font-black uppercase text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{step.copy}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MomentumSection() {
  return (
    <section className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass-panel grid gap-8 overflow-hidden p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="grid h-48 place-items-center border border-white/10 bg-black/30 sm:h-64">
            <Target size={74} className="text-signal" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-heat">
              Momentum Beats Motivation
            </p>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.95] text-white sm:text-5xl">
              Ideas die when they stay in your head.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              Most people do not need more motivation. They need structure, direction, and someone who can
              turn the idea into the next real step. DFB is built for that moment: when you are tired of
              thinking about the thing and ready to see it on a screen, in a system, or in front of customers.
            </p>
            <a href="#start-project" className="btn-primary mt-7">
              <Clock3 size={18} aria-hidden="true" />
              Send My Build Request
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="section-shell relative">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <SectionHeader
          eyebrow="About DFB"
          title="A creative-tech studio for real people building real things."
          subtitle="DFB Solutions helps turn ideas into usable digital products, brands, and systems. The studio bridges design, code, content, and business systems so creators, founders, and local operators can move with more clarity."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {["Design that looks official", "Code that works in the real world", "Content systems with rhythm", "Business workflows with structure"].map((item) => (
            <div key={item} className="border border-white/[0.12] bg-white/[0.055] p-5">
              <Check size={18} className="text-signal" aria-hidden="true" />
              <p className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-white">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntakeSection() {
  const [form, setForm] = useState(() => initialFormState());
  const [status, setStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    function applyProjectTypeFromHash() {
      const [, queryString] = window.location.hash.split("?");

      if (!queryString) {
        return;
      }

      const requestedType = new URLSearchParams(queryString).get("projectType");

      if (projectTypeOptions.includes(requestedType)) {
        setForm((current) => ({
          ...current,
          projectType: requestedType,
        }));
      }
    }

    applyProjectTypeFromHash();
    window.addEventListener("hashchange", applyProjectTypeFromHash);

    return () => window.removeEventListener("hashchange", applyProjectTypeFromHash);
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
      setStatusMessage(result.message || "Build request sent successfully.");
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
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <SectionHeader
              eyebrow="Start A Project"
              title="You bring the idea. DFB makes it real."
              subtitle="Tell me what you are building, where it is stuck, and what needs to happen next. The form routes into the existing DFB contact endpoint."
            />
            <div className="border border-white/10 bg-black/30 p-5 text-sm leading-6 text-slate-300">
              Best inputs: what you need built, who it is for, links to what exists now, your ideal timeline,
              and what would make the project feel like a win.
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
              <Field label="Name" name="name" autoComplete="name" maxLength={120} onChange={handleChange} required value={form.name} />
              <Field label="Email" name="email" type="email" autoComplete="email" maxLength={200} onChange={handleChange} required value={form.email} />
            </div>
            <Field label="Business / brand name" name="businessName" maxLength={160} onChange={handleChange} value={form.businessName} />
            <Field label="What do you need built?" name="need" maxLength={300} onChange={handleChange} required value={form.need} />
            <div className="grid gap-4 sm:grid-cols-3">
              <Select label="Project type" name="projectType" onChange={handleChange} options={projectTypeOptions} required value={form.projectType} />
              <Select label="Budget range" name="budget" onChange={handleChange} options={budgetOptions} required value={form.budget} placeholder="Select range" />
              <Field label="Timeline" name="timeline" maxLength={100} onChange={handleChange} required value={form.timeline} />
            </div>
            <Field label="Current website or links, optional" name="links" maxLength={500} onChange={handleChange} value={form.links} />
            <label className="field-label">
              Message / details
              <textarea
                name="message"
                rows="6"
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
              style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
            />
            <button type="submit" className="btn-primary justify-center" disabled={isSubmitting}>
              <Send size={18} aria-hidden="true" />
              {isSubmitting ? "Sending..." : "Send My Build Request"}
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

function Select({ label, name, options, placeholder, ...props }) {
  return (
    <label className="field-label">
      {label}
      <select name={name} className="field-control" {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
