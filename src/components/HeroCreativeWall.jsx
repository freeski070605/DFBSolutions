import { motion } from "framer-motion";
import {
  AudioWaveform,
  Brush,
  Camera,
  Compass,
  Cuboid,
  Hammer,
  Layers3,
  Sparkles,
} from "lucide-react";

const collageCards = [
  {
    title: "Capture",
    subtitle: "Wedding / Event / Brand Visuals",
    icon: Camera,
    className:
      "bg-gradient-to-br from-sky-400/24 via-white/[0.08] to-black/50 sm:left-[3%] sm:top-[8%] sm:w-[48%] sm:rotate-[-5deg] lg:left-[2%] lg:top-[9%]",
    visual: "photo",
  },
  {
    title: "Build",
    subtitle: "Apps / Landing Pages / Digital Tools",
    icon: Layers3,
    className:
      "bg-gradient-to-br from-emerald-300/20 via-cyan-300/10 to-black/55 sm:right-[2%] sm:top-[3%] sm:w-[43%] sm:rotate-[4deg] lg:right-[4%]",
    visual: "product",
  },
  {
    title: "Create",
    subtitle: "Content Packs / Flyers / Brand Kits",
    icon: Brush,
    className:
      "bg-gradient-to-br from-fuchsia-300/18 via-heat/14 to-black/55 sm:left-[8%] sm:top-[40%] sm:z-20 sm:w-[40%] sm:rotate-[3deg]",
    visual: "design",
  },
  {
    title: "Release",
    subtitle: "Music / Video / DSPs",
    icon: AudioWaveform,
    className:
      "bg-gradient-to-br from-heat/22 via-rose-300/12 to-black/60 sm:right-[7%] sm:top-[36%] sm:z-30 sm:w-[39%] sm:rotate-[-4deg] lg:right-[8%]",
    visual: "waveform",
  },
  {
    title: "Experiment",
    subtitle: "Chester Open World / AI Artist / ReemTeam VR",
    icon: Cuboid,
    className:
      "bg-gradient-to-br from-violet-300/20 via-voltage/12 to-black/60 sm:left-[2%] sm:bottom-[7%] sm:w-[45%] sm:rotate-[5deg]",
    visual: "lab",
  },
  {
    title: "Originals",
    subtitle: "ReemTeam / Study App / SignalFlow",
    icon: Sparkles,
    className:
      "bg-gradient-to-br from-white/[0.14] via-signal/12 to-black/65 sm:right-[4%] sm:bottom-[5%] sm:z-20 sm:w-[43%] sm:rotate-[-2deg]",
    visual: "originals",
  },
];

const proofTags = ["Photography", "Branding", "Apps", "Music", "Media", "AI Workflows"];

export default function HeroCreativeWall() {
  return (
    <section id="home" className="section-shell relative min-h-screen overflow-hidden pt-28 sm:pt-32">
      <div className="absolute inset-x-0 top-20 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.11),transparent_58%)]" />
      <div className="mx-auto grid min-w-0 max-w-7xl items-center gap-12 px-4 pb-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 min-w-0 max-w-[22.5rem] sm:max-w-none"
        >
          <p className="mb-5 text-xs font-black uppercase tracking-[0.28em] text-signal sm:mb-6">
            DFB SOLUTIONS
          </p>
          <h1 className="max-w-5xl break-words font-display text-[2.75rem] font-black uppercase leading-[0.96] text-white min-[420px]:text-5xl sm:text-7xl sm:leading-[0.9] lg:text-8xl">
            Where Ideas Become Assets.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-xl sm:leading-8">
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
              Explore The Work
            </a>
            <a href="#start-project" className="btn-ghost">
              <Hammer size={18} aria-hidden="true" />
              Start A Build
            </a>
          </div>
          <div className="mt-8 flex max-w-xl flex-wrap gap-2">
            {proofTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-300 backdrop-blur"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        <CreativeCollage />
      </div>
    </section>
  );
}

function CreativeCollage() {
  return (
    <motion.div
      className="relative z-10 mx-auto grid min-w-0 w-full max-w-[22.5rem] grid-cols-1 gap-3 sm:block sm:min-h-[680px] sm:max-w-[680px] lg:min-h-[760px]"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.12 }}
    >
      <div className="absolute inset-6 rounded-full bg-voltage/12 blur-3xl" />
      <div className="absolute bottom-8 right-4 h-52 w-52 rounded-full bg-heat/10 blur-3xl" />
      <div className="absolute left-[24%] top-[24%] font-display text-[9rem] font-black uppercase leading-none text-white/[0.035] sm:text-[13rem] lg:text-[15rem]">
        DFB
      </div>
      <div className="absolute inset-x-[12%] top-[18%] h-[64%] rotate-[-10deg] border-y border-white/10 bg-white/[0.025]" />

      {collageCards.map((card, index) => (
        <CollageCard key={card.title} card={card} index={index} />
      ))}
    </motion.div>
  );
}

function CollageCard({ card, index }) {
  const Icon = card.icon;

  return (
    <motion.article
      className={`group relative ${index > 2 ? "hidden sm:block" : ""} overflow-hidden rounded-2xl border border-white/[0.14] p-4 shadow-2xl backdrop-blur-xl sm:absolute sm:p-5 ${card.className}`}
      animate={{ y: [0, index % 2 ? -10 : 10, 0] }}
      transition={{
        duration: 5.2 + index * 0.35,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{ y: -10, rotate: 0, scale: 1.025 }}
    >
      <div className="noise-layer absolute inset-0 opacity-[0.08]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.16),transparent_34%,rgba(255,255,255,.04))]" />
      <div className="relative">
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/10 text-white sm:h-10 sm:w-10">
            <Icon size={18} aria-hidden="true" />
          </span>
          <span className="font-display text-2xl font-black uppercase leading-none text-white/15 sm:text-4xl">
            0{index + 1}
          </span>
        </div>
        <CardVisual type={card.visual} />
        <h2 className="mt-4 font-display text-xl font-black uppercase leading-none text-white sm:mt-5 sm:text-3xl">
          {card.title}
        </h2>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-300">
          {card.subtitle}
        </p>
      </div>
    </motion.article>
  );
}

function CardVisual({ type }) {
  const base = "relative h-20 overflow-hidden rounded-xl border border-white/10 bg-black/25 sm:h-24";

  if (type === "waveform") {
    return (
      <div className={base}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_35%,rgba(255,179,71,.32),transparent_34%)]" />
        <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 items-center justify-between gap-1">
          {[28, 52, 36, 68, 44, 74, 38, 58, 32].map((height, index) => (
            <span
              key={index}
              className="w-1.5 rounded-full bg-white/70"
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (type === "product") {
    return (
      <div className={base}>
        <div className="absolute left-4 top-4 h-10 w-24 rounded-lg bg-white/15" />
        <div className="absolute bottom-4 left-4 right-4 h-3 rounded-full bg-signal/45" />
        <div className="absolute right-5 top-5 h-14 w-14 rounded-2xl bg-voltage/35 shadow-glow" />
      </div>
    );
  }

  if (type === "design") {
    return (
      <div className={base}>
        <div className="absolute -left-5 top-4 h-20 w-20 rounded-full border border-white/20 bg-fuchsia-300/20" />
        <div className="absolute right-4 top-5 h-12 w-28 rotate-[-7deg] bg-white/15" />
        <div className="absolute bottom-4 right-8 h-8 w-20 rotate-[6deg] bg-heat/35" />
      </div>
    );
  }

  if (type === "lab") {
    return (
      <div className={base}>
        <div className="absolute left-5 top-5 h-16 w-16 rotate-45 border border-voltage/55 bg-voltage/15" />
        <div className="absolute right-5 top-4 h-20 w-20 rounded-full border border-white/15" />
        <div className="absolute bottom-4 right-10 h-3 w-28 bg-white/20" />
      </div>
    );
  }

  if (type === "originals") {
    return (
      <div className={base}>
        <div className="absolute inset-3 grid grid-cols-3 gap-2">
          <span className="rounded-lg bg-white/12" />
          <span className="rounded-lg bg-signal/24" />
          <span className="rounded-lg bg-voltage/20" />
          <span className="col-span-2 rounded-lg bg-heat/20" />
          <span className="rounded-lg bg-white/16" />
        </div>
      </div>
    );
  }

  return (
    <div className={base}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,.4),transparent_20%),linear-gradient(135deg,rgba(53,167,255,.3),rgba(255,255,255,.08),rgba(0,0,0,.25))]" />
      <div className="absolute bottom-4 left-4 h-10 w-28 rounded-full bg-black/35 blur-sm" />
      <div className="absolute right-5 top-5 h-16 w-16 rounded-full border border-white/20 bg-white/10" />
    </div>
  );
}
