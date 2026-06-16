import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Send } from "lucide-react";

const serviceProjectType = {
  "Photography & Visual Media": "Photography / Visual Media",
  "Brand & Business Assets": "Branding / Content",
  "Content Systems": "Branding / Content",
  "Websites & Landing Pages": "Website / Landing Page",
  "Apps & Digital Tools": "App / Digital Tool",
  "AI / Automation Workflows": "AI Workflow",
};

const cardAccents = [
  "from-voltage/18 via-white/[0.035] to-transparent",
  "from-signal/16 via-white/[0.035] to-transparent",
  "from-heat/18 via-white/[0.035] to-transparent",
  "from-fuchsia-300/14 via-white/[0.035] to-transparent",
];

export default function ServiceCard({ service, index }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = service.icon;
  const visibleItems = expanded ? service.items : service.items.slice(0, 4);
  const hasMore = service.items.length > visibleItems.length;
  const projectType = serviceProjectType[service.title] || "Other";
  const requestHref = `#start-project?projectType=${encodeURIComponent(projectType)}`;

  return (
    <motion.article
      className={`command-card ${index % 3 === 0 ? "lg:row-span-1" : ""}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={{ y: -6 }}
    >
      <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${cardAccents[index % cardAccents.length]}`} />
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 place-items-center border border-voltage/35 bg-voltage/10 text-sky-100 shadow-glow">
          <Icon size={22} aria-hidden="true" />
        </span>
        <span className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-slate-500">
          Studio Lane {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="relative mt-5 font-display text-2xl font-black uppercase leading-none text-white">
        {service.title}
      </h3>
      <p className="relative mt-3 text-sm leading-6 text-slate-300">{service.description}</p>
      <div className="relative mt-5 grid gap-2">
        {visibleItems.map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 border border-white/[0.08] bg-black/20 px-3 py-2 text-sm text-slate-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            {item}
          </div>
        ))}
      </div>
      <div className="relative mt-5 flex flex-wrap gap-2">
        {hasMore || expanded ? (
          <button
            type="button"
            className="micro-cta"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            <ChevronDown
              className={expanded ? "rotate-180 transition" : "transition"}
              size={15}
              aria-hidden="true"
            />
            {expanded ? "Less" : "More"}
          </button>
        ) : null}
        <a href={requestHref} className="micro-cta">
          <Send size={15} aria-hidden="true" />
          Request This
        </a>
      </div>
    </motion.article>
  );
}
