import { motion } from "framer-motion";
import { Camera, CalendarCheck } from "lucide-react";
import SectionHeader from "./SectionHeader.jsx";

const mediaItems = [
  "Wedding & event photography",
  "Brand visuals",
  "Portraits",
  "Promo shoots",
  "Product/lifestyle content",
  "Video/photo direction",
];

export default function MediaSection() {
  return (
    <section id="media" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <SectionHeader
            eyebrow="Media / Visual Work"
            title="Media That Feels Like The Brand, Not Just A Camera Roll."
          />
          <p className="mb-10 text-base leading-7 text-slate-300">
            Visual work sits near the front of DFB because moments, launches,
            products, and people deserve direction before they become content.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mediaItems.map((item, index) => (
            <motion.article
              key={item}
              role="img"
              aria-label={`${item} abstract placeholder`}
              className="media-tile"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              whileHover={{ y: -7 }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(53,167,255,.35),transparent_25%),radial-gradient(circle_at_80%_18%,rgba(255,179,71,.2),transparent_24%),linear-gradient(135deg,rgba(255,255,255,.12),rgba(255,255,255,.02))]" />
              <div className="absolute inset-0 bg-control-grid bg-[length:32px_32px] opacity-20" />
              <div className="relative flex h-full flex-col justify-between">
                <Camera className="text-white/80" size={24} aria-hidden="true" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">
                    Visual Set
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-black uppercase leading-none text-white">
                    {item}
                  </h3>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-8">
          <a href="#start-project" className="btn-primary">
            <CalendarCheck size={18} aria-hidden="true" />
            Book Visual Work
          </a>
        </div>
      </div>
    </section>
  );
}
