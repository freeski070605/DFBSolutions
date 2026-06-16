import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import StatusPill from "./StatusPill.jsx";

export default function ProjectCard({ project, index }) {
  return (
    <motion.article
      className="project-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -7 }}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-voltage">
            {project.category}
          </p>
          <h3 className="mt-2 font-display text-3xl font-black uppercase leading-none text-white">
            {project.title}
          </h3>
        </div>
        <StatusPill tone={index % 3 === 0 ? "green" : index % 3 === 1 ? "blue" : "chrome"}>
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
