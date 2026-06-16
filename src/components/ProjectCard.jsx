import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import StatusPill from "./StatusPill.jsx";

export default function ProjectCard({ project, index }) {
  const accents = {
    signal: {
      shell: "lg:col-span-2 border-signal/25 bg-gradient-to-br from-signal/[0.12] via-white/[0.055] to-black/20",
      eyebrow: "text-signal",
      glow: "bg-signal/30",
      pill: "green",
    },
    voltage: {
      shell: "border-voltage/25 bg-gradient-to-br from-voltage/[0.12] via-white/[0.045] to-black/20",
      eyebrow: "text-voltage",
      glow: "bg-voltage/30",
      pill: "blue",
    },
    heat: {
      shell: "border-heat/25 bg-gradient-to-br from-heat/[0.13] via-white/[0.045] to-black/20",
      eyebrow: "text-heat",
      glow: "bg-heat/30",
      pill: "heat",
    },
    violet: {
      shell: "border-fuchsia-300/20 bg-gradient-to-br from-fuchsia-300/[0.12] via-voltage/[0.05] to-black/20",
      eyebrow: "text-fuchsia-100",
      glow: "bg-fuchsia-300/30",
      pill: "chrome",
    },
    rose: {
      shell: "border-rose-300/20 bg-gradient-to-br from-rose-300/[0.12] via-white/[0.045] to-black/20",
      eyebrow: "text-rose-100",
      glow: "bg-rose-300/30",
      pill: "chrome",
    },
    chrome: {
      shell: "border-white/20 bg-gradient-to-br from-white/[0.12] via-white/[0.045] to-black/20",
      eyebrow: "text-slate-100",
      glow: "bg-white/25",
      pill: "chrome",
    },
    ink: {
      shell: "border-slate-400/20 bg-gradient-to-br from-slate-300/[0.10] via-white/[0.035] to-black/30",
      eyebrow: "text-slate-200",
      glow: "bg-slate-300/25",
      pill: "chrome",
    },
  };
  const accent = accents[project.accent] || accents.voltage;

  return (
    <motion.article
      className={`project-card ${accent.shell}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -7 }}
    >
      <div className={`absolute right-6 top-6 h-24 w-24 rounded-full ${accent.glow} blur-3xl`} />
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className={`text-xs font-black uppercase tracking-[0.2em] ${accent.eyebrow}`}>
            {project.category}
          </p>
          <h3 className={project.featured ? "mt-2 font-display text-4xl font-black uppercase leading-none text-white sm:text-5xl" : "mt-2 font-display text-3xl font-black uppercase leading-none text-white"}>
            {project.title}
          </h3>
        </div>
        <StatusPill tone={accent.pill}>
          {project.status}
        </StatusPill>
      </div>
      <p className="text-sm leading-6 text-slate-300">{project.description}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-bold text-slate-300"
          >
            {tag}
          </span>
        ))}
      </div>
      <a href="#start-project" className="micro-cta mt-7">
        <ArrowUpRight size={16} aria-hidden="true" />
        View Build
      </a>
    </motion.article>
  );
}
