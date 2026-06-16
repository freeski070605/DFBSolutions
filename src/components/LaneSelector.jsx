import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { lanes } from "../data/services.js";
import SectionHeader from "./SectionHeader.jsx";

export default function LaneSelector() {
  return (
    <section className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Choose Your Lane"
          title="What Do You Need Built?"
          subtitle="Whether you came for a service, a system, a project, or the sound, DFB gives every idea a lane."
          align="center"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {lanes.map((lane, index) => (
            <motion.a
              key={lane.title}
              href={lane.href}
              className={`lane-card lane-${lane.tone}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.48, delay: index * 0.08 }}
              whileHover={{ y: -8 }}
            >
              <span className="mb-12 block text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                0{index + 1}
              </span>
              <h3 className="font-display text-3xl font-black uppercase leading-none text-white">
                {lane.title}
              </h3>
              <p className="mt-5 min-h-24 text-sm leading-6 text-slate-300">
                {lane.subtitle}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-white">
                {lane.cta}
                <ArrowUpRight size={17} aria-hidden="true" />
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
