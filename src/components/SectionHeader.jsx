import { motion } from "framer-motion";

export default function SectionHeader({ eyebrow, title, subtitle, align = "left" }) {
  return (
    <motion.div
      className={`mx-auto mb-10 max-w-3xl ${align === "center" ? "text-center" : ""}`}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55 }}
    >
      {eyebrow && (
        <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-signal">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl font-black uppercase leading-[0.95] text-white sm:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
