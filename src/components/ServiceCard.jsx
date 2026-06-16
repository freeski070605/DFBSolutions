import { motion } from "framer-motion";
import { Send } from "lucide-react";

export default function ServiceCard({ service, index }) {
  const Icon = service.icon;

  return (
    <motion.article
      className="command-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={{ y: -6 }}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 place-items-center border border-voltage/35 bg-voltage/10 text-sky-100 shadow-glow">
          <Icon size={22} aria-hidden="true" />
        </span>
        <span className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-slate-500">
          Module {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="mt-6 font-display text-2xl font-black uppercase leading-none text-white">
        {service.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{service.description}</p>
      <div className="mt-6 grid gap-2">
        {service.items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-sm text-slate-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            {item}
          </div>
        ))}
      </div>
      <a href="#start-project" className="micro-cta mt-6">
        <Send size={15} aria-hidden="true" />
        Request this
      </a>
    </motion.article>
  );
}
