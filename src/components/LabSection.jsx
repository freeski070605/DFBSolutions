import { motion } from "framer-motion";
import { FlaskConical, Orbit } from "lucide-react";
import { labItems } from "../data/labItems.js";
import SectionHeader from "./SectionHeader.jsx";

export default function LabSection() {
  return (
    <section id="lab" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="DFB Lab"
          title="The Lab Is Where The Wild Ideas Get Built."
          subtitle="Some ideas are client work. Some are products. Some are experiments that turn into the next wave."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {labItems.map((item, index) => (
            <motion.article
              key={item.title}
              className="lab-card"
              initial={{ opacity: 0, rotateX: -8, y: 20 }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              whileHover={{ y: -8, rotate: index % 2 ? 0.5 : -0.5 }}
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-signal/30 bg-signal/10 text-signal">
                  {index % 2 ? <Orbit size={19} /> : <FlaskConical size={19} />}
                </span>
                <span className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-signal">
                  {item.status}
                </span>
              </div>
              <h3 className="mt-7 font-display text-2xl font-black uppercase leading-none text-white">
                {item.title}
              </h3>
              <div className="mt-6 h-px bg-gradient-to-r from-signal/70 via-voltage/50 to-transparent" />
              <p className="mt-4 text-sm leading-6 text-slate-400">
                {item.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
