import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { stats } from "../data/stats.js";
import SectionHeader from "./SectionHeader.jsx";

export default function ReceiptsSection() {
  return (
    <section className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Proof"
          title="Receipts Over Resumes."
          subtitle="DFB is built on proof of creation - not empty titles."
          align="center"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((item, index) => (
            <motion.article
              key={item.label}
              className="receipt-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
            >
              <BadgeCheck className="text-signal" size={19} aria-hidden="true" />
              <span className="mt-8 block text-xs font-black uppercase tracking-[0.18em] text-voltage">
                {item.status}
              </span>
              <p className="mt-3 text-sm font-bold leading-5 text-white">{item.label}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
