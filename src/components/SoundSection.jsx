import { motion } from "framer-motion";
import { Music2, Play } from "lucide-react";
import SectionHeader from "./SectionHeader.jsx";

const dspLinks = [];

const youtubeUrl = "https://youtu.be/hu2nJCrIzno?si=tytmkSBqa44IgSWj";

export default function SoundSection() {
  return (
    <section id="sound" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Sound"
          title="The Sound Behind The Vision."
          subtitle="Before the builds, brands, apps, and systems, there was the voice. DFB carries real life, storytelling, pain, purpose, ambition, and culture into everything created under the brand."
          align="center"
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            className="glass-panel overflow-hidden p-3"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55 }}
          >
            <div className="aspect-video overflow-hidden border border-white/10 bg-black">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/hu2nJCrIzno?si=Jfork_gaabPqlLsl"
                title="Friday The 14th official video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </motion.div>

          <motion.article
            className="project-card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <div className="mb-8 flex items-center justify-between gap-4">
              <span className="grid h-12 w-12 place-items-center border border-heat/35 bg-heat/10 text-amber-100">
                <Music2 size={23} aria-hidden="true" />
              </span>
              <span className="text-xs font-black uppercase tracking-[0.22em] text-heat">
                Official Video / Music Release
              </span>
            </div>
            <h3 className="font-display text-4xl font-black uppercase leading-none text-white">
              Friday The 14th
            </h3>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              Culture inside the DFB universe: music as memory, message, and
              motion behind the builds.
            </p>
            {dspLinks.length > 0 && (
              <div className="mt-7 grid grid-cols-2 gap-2">
                {dspLinks.map((service) => (
                  <a key={service.label} href={service.url} className="stream-link" target="_blank" rel="noreferrer">
                    {service.label}
                  </a>
                ))}
              </div>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={youtubeUrl} className="btn-primary" target="_blank" rel="noreferrer">
                <Play size={18} aria-hidden="true" />
                Watch Video
              </a>
              <a href="#media" className="btn-ghost">
                View Artist Media
              </a>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
