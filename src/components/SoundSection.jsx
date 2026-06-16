import { motion } from "framer-motion";
import { Mail, Music2, Play, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { getStreamingLinks, hasLink, links } from "../data/links.js";
import SectionHeader from "./SectionHeader.jsx";

export default function SoundSection() {
  const streamingLinks = getStreamingLinks();

  return (
    <section id="sound" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Sound"
          title="The Sound Behind The Vision."
          subtitle="Music is one part of the DFB universe - the voice behind the builds, the brands, and the systems."
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
            {streamingLinks.length > 0 && (
              <div className="mt-7 grid grid-cols-2 gap-2">
                {streamingLinks.map(([label, url]) => (
                  <a key={label} href={url} className="stream-link" target="_blank" rel="noreferrer">
                    {label}
                  </a>
                ))}
              </div>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/sound" className="btn-primary">
                <Radio size={18} aria-hidden="true" />
                Enter DFB Sound
              </Link>
              <Link to="/sound#free-list" className="btn-secondary">
                <Mail size={18} aria-hidden="true" />
                Join The Free List
              </Link>
              {hasLink(links.youtube) && (
                <Link to="/sound#featured-release" className="btn-ghost">
                  <Play size={18} aria-hidden="true" />
                  Watch Friday The 14th
                </Link>
              )}
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
