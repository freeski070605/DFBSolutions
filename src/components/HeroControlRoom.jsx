import { motion } from "framer-motion";
import { ArrowRight, Compass, RadioTower, Sparkles } from "lucide-react";
import { heroSystems } from "../data/projects.js";
import StatusPill from "./StatusPill.jsx";

export default function HeroControlRoom() {
  return (
    <section id="home" className="section-shell relative min-h-screen pt-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10"
        >
          <div className="mb-5 inline-flex items-center gap-3 border border-white/15 bg-white/[0.07] px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-200 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-signal shadow-[0_0_16px_rgba(50,255,157,.8)]" />
            DFB HQ LIVE
          </div>
          <p className="mb-5 text-xs font-black uppercase tracking-[0.28em] text-signal">
            DFB Solutions // Creative-Tech Studio
          </p>
          <h1 className="max-w-5xl font-display text-5xl font-black uppercase leading-[0.9] text-white sm:text-7xl lg:text-8xl">
            Where Ideas Become Assets.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            DFB Solutions helps people turn moments, brands, businesses,
            music, apps, and raw ideas into professional digital assets built
            to be seen, used, streamed, booked, or bought.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#start-project" className="btn-primary">
              <Sparkles size={18} aria-hidden="true" />
              Start A Project
            </a>
            <a href="#featured-builds" className="btn-secondary">
              <Compass size={18} aria-hidden="true" />
              Explore The Builds
            </a>
            <a href="#lab" className="btn-ghost">
              <RadioTower size={18} aria-hidden="true" />
              Enter The Lab
            </a>
          </div>
        </motion.div>

        <ControlRoomPanel />
      </div>
    </section>
  );
}

function ControlRoomPanel() {
  return (
    <motion.div
      className="relative z-10 min-h-[560px]"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.12 }}
    >
      <div className="absolute inset-0 rounded-[2rem] bg-voltage/10 blur-3xl" />
      <div className="glass-panel relative overflow-hidden p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.26em] text-slate-400">
              Control Room
            </p>
            <h2 className="mt-1 font-display text-2xl font-black uppercase text-white">
              Asset Pipeline
            </h2>
          </div>
          <StatusPill tone="green">Live</StatusPill>
        </div>

        <div className="relative grid gap-3 sm:grid-cols-2">
          {heroSystems.map(([category, title], index) => (
            <motion.article
              key={title}
              className="group border border-white/[0.12] bg-black/[0.24] p-4 backdrop-blur transition hover:border-voltage/50 hover:bg-voltage/10"
              animate={{ y: [0, index % 2 ? -7 : 7, 0] }}
              transition={{
                duration: 4.5 + index * 0.25,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-signal">
                  {category}
                </span>
                <span className="h-2 w-2 rounded-full bg-signal shadow-[0_0_12px_rgba(50,255,157,.9)]" />
              </div>
              <h3 className="min-h-12 font-display text-lg font-black uppercase leading-tight text-white">
                {title}
              </h3>
              <div className="mt-4 h-1.5 overflow-hidden bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-voltage via-signal to-heat"
                  initial={{ width: "34%" }}
                  animate={{ width: [`${36 + index * 5}%`, "92%", `${52 + index * 3}%`] }}
                  transition={{
                    duration: 5 + index * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-5 grid gap-3 border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-3">
          {["Intake", "Build", "Asset"].map((step, index) => (
            <div key={step} className="flex items-center gap-3 text-sm text-slate-300">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/10 text-xs font-black text-white">
                {index + 1}
              </span>
              <span className="font-bold uppercase tracking-[0.14em]">{step}</span>
              {index < 2 && <ArrowRight className="hidden text-slate-500 sm:block" size={15} />}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
