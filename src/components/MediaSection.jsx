import { motion } from "framer-motion";
import { Camera, CalendarCheck } from "lucide-react";
import SectionHeader from "./SectionHeader.jsx";

const mediaItems = [
  "Wedding Coverage",
  "Event Recaps",
  "Brand Shoots",
  "Portrait Sessions",
  "Promo Visuals",
  "Product / Lifestyle Content",
  "Video / Photo Direction",
];

export default function MediaSection() {
  return (
    <section id="media" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {mediaItems.map((item, index) => (
            <motion.article
              key={item}
              role="img"
              aria-label={`${item} abstract visual panel`}
              className={`media-tile ${index === 0 || index === 6 ? "lg:col-span-3" : "lg:col-span-2"} ${index === 1 ? "lg:row-span-2" : ""}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              whileHover={{ y: -7 }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(53,167,255,.38),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(255,179,71,.24),transparent_24%),linear-gradient(135deg,rgba(255,255,255,.14),rgba(255,255,255,.02))]" />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <div className="noise-layer absolute inset-0 opacity-[0.08]" />
              <div className="absolute left-6 top-6 h-24 w-32 rotate-[-7deg] rounded-[50%] border border-white/10 bg-white/10 blur-sm" />
              <div className="absolute bottom-12 right-6 h-20 w-28 rotate-[9deg] bg-white/10" />
              <div className="relative flex h-full flex-col justify-between">
                <Camera className="text-white/80" size={24} aria-hidden="true" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-signal">
                    Visual Direction
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-black uppercase leading-none text-white">
                    {item}
                  </h3>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <a href="#start-project" className="btn-primary">
            <CalendarCheck size={18} aria-hidden="true" />
            Book Visual Work
          </a>
          <p className="max-w-md text-sm leading-6 text-slate-500">
            Full visual gallery coming as new shoots and client work are added.
          </p>
        </div>
      </div>
    </section>
  );
}
