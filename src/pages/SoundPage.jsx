import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Coffee,
  Headphones,
  HeartHandshake,
  LockKeyhole,
  Mail,
  Music2,
  Play,
  Radio,
  Send,
  Sparkles,
  Video,
  Waves,
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { getStreamingLinks, getSupportLinks, hasLink, links } from "../data/links.js";
import { releases } from "../data/releases.js";

const favoritePlatforms = [
  "Spotify",
  "Apple Music",
  "YouTube Music",
  "Tidal",
  "Audiomack",
  "SoundCloud",
  "Other",
];

const storyCards = [
  {
    title: "The Moment",
    copy:
      "Every song starts somewhere real - a memory, a pressure point, a lesson, or a moment that needed somewhere to go.",
  },
  {
    title: "The Line",
    copy:
      "The bars are not just lyrics. They carry the same energy behind DFB: pain turned into direction, ideas turned into assets, and survival turned into motion.",
  },
  {
    title: "The Feeling",
    copy:
      "The goal is for people to hear the record and feel like somebody put language to something they already knew but could not explain.",
  },
];

const vaultItems = [
  "Unreleased Previews",
  "Demo Voice Notes",
  "Behind The Song",
  "Early Merch Drops",
  "Private Video Links",
  "Digital Supporter Packs",
];

const releaseKitItems = [
  "Song landing page",
  "Cover/visual direction",
  "7-day rollout content plan",
  "Captions and hooks",
  "DSP/link hub structure",
  "Artist bio/press copy",
  "Short-form promo ideas",
  "Email capture setup",
];

export default function SoundPage() {
  return (
    <>
      <main>
        <SoundHero />
        <FeaturedRelease />
        <StoryBehindSong />
        <FreeListSection />
        <VaultPreview />
        <VideosReleases />
        <SupportSound />
        <ArtistReleaseKit />
      </main>
      <Footer />
    </>
  );
}

function SoundHero() {
  return (
    <section className="section-shell relative min-h-screen overflow-hidden pt-28 sm:pt-32">
      <div className="absolute inset-x-0 top-20 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(255,179,71,.16),transparent_58%)]" />
      <div className="mx-auto grid min-w-0 max-w-7xl items-center gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <motion.div
          className="relative z-10 min-w-0 max-w-[22.5rem] sm:max-w-none"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="mb-5 text-xs font-black uppercase tracking-[0.28em] text-heat">
            DFB SOUND
          </p>
          <h1 className="max-w-4xl break-words font-display text-[2.75rem] font-black uppercase leading-[0.96] text-white min-[420px]:text-5xl sm:text-7xl sm:leading-[0.92] lg:text-8xl">
            The Sound Behind The Vision.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-xl sm:leading-8">
            Real life. Real voice. Built from pain, purpose, ambition, and the
            work it takes to turn survival into something bigger.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#featured-release" className="btn-primary">
              <Play size={18} aria-hidden="true" />
              Watch Friday The 14th
            </a>
            <a href="#free-list" className="btn-secondary">
              <Mail size={18} aria-hidden="true" />
              Join The Free List
            </a>
            <a href="#support" className="btn-ghost">
              <HeartHandshake size={18} aria-hidden="true" />
              Support Directly
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {["Music", "Videos", "Stories", "Drops", "The Vault"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-300"
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        <SoundCollage />
      </div>
    </section>
  );
}

function SoundCollage() {
  return (
    <motion.div
      className="relative z-10 mx-auto min-h-[440px] w-full max-w-[22.5rem] overflow-hidden sm:min-h-[620px] sm:max-w-[640px] sm:overflow-visible"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.12 }}
    >
      <div className="absolute inset-8 rounded-full bg-heat/15 blur-3xl" />
      <div className="absolute left-[4%] top-[8%] h-[68%] w-[76%] rotate-[-5deg] overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-heat/24 via-white/[0.08] to-black/60 p-5 shadow-2xl backdrop-blur-xl sm:left-[8%] sm:w-[68%] sm:rotate-[-7deg]">
        <div className="noise-layer absolute inset-0 opacity-[0.08]" />
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/10">
              <Music2 size={22} aria-hidden="true" />
            </span>
            <span className="font-display text-6xl font-black text-white/10">DFB</span>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-heat">
              Featured Release
            </p>
            <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none text-white">
              Friday The 14th
            </h2>
          </div>
        </div>
      </div>
      <div className="absolute right-[2%] top-[28%] w-[46%] rotate-[3deg] rounded-2xl border border-white/12 bg-black/40 p-4 shadow-2xl backdrop-blur-xl sm:right-[3%] sm:top-[23%] sm:w-[48%] sm:rotate-[5deg] sm:p-5">
        <Waves className="mb-7 text-signal" size={24} aria-hidden="true" />
        <div className="flex h-28 items-center justify-between gap-1">
          {[38, 68, 44, 78, 58, 92, 50, 72, 42].map((height, index) => (
            <span key={index} className="w-2 rounded-full bg-white/70" style={{ height }} />
          ))}
        </div>
      </div>
      <div className="absolute bottom-[10%] right-[5%] w-[70%] rotate-[-2deg] rounded-2xl border border-white/12 bg-gradient-to-br from-voltage/14 to-black/60 p-4 shadow-2xl backdrop-blur-xl sm:bottom-[8%] sm:right-[10%] sm:w-[58%] sm:rotate-[-3deg] sm:p-5">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-signal text-black">
            <Play size={18} fill="currentColor" aria-hidden="true" />
          </span>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">
            Direct To Community
          </span>
        </div>
        <p className="text-sm leading-6 text-slate-300">
          Drops, stories, private previews, and the fan list DFB owns directly.
        </p>
      </div>
    </motion.div>
  );
}

function FeaturedRelease() {
  const streamingLinks = getStreamingLinks();

  return (
    <section id="featured-release" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeader eyebrow="Featured Release" title="Friday The 14th" />
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            className="glass-panel overflow-hidden p-3"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
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
            className="project-card bg-gradient-to-br from-heat/[0.12] via-white/[0.045] to-black/20"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <p className="text-xs font-black uppercase tracking-[0.22em] text-heat">
              Official Video / Music Release
            </p>
            <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none text-white">
              Friday The 14th
            </h2>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              A release from the DFB universe - music as memory, message, and
              motion behind the builds.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {hasLink(links.youtube) && (
                <a href={links.youtube} className="btn-primary" target="_blank" rel="noreferrer">
                  <Play size={18} aria-hidden="true" />
                  Watch On YouTube
                </a>
              )}
              {streamingLinks.length > 0 &&
                streamingLinks.slice(0, 1).map(([label, url]) => (
                  <a key={label} href={url} className="btn-secondary" target="_blank" rel="noreferrer">
                    <Headphones size={18} aria-hidden="true" />
                    Stream Music
                  </a>
                ))}
              <a href="#free-list" className="btn-ghost">
                Join The Free List
              </a>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}

function StoryBehindSong() {
  return (
    <section className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeader
          eyebrow="Story"
          title="Story Behind The Song"
          subtitle="Not liner notes. Context for the feeling behind the record."
          align="center"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {storyCards.map((card, index) => (
            <motion.article
              key={card.title}
              className="project-card bg-gradient-to-br from-white/[0.09] to-white/[0.025]"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
            >
              <span className="font-display text-5xl font-black text-white/10">
                0{index + 1}
              </span>
              <h3 className="mt-8 font-display text-2xl font-black uppercase leading-none text-white">
                {card.title}
              </h3>
              <p className="mt-4 text-sm leading-6 text-slate-300">{card.copy}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FreeListSection() {
  const [form, setForm] = useState({
    email: "",
    phone: "",
    favoritePlatform: "",
    companyWebsite: "",
  });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/join-free-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "DFB Sound Page" }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success !== true) {
        throw new Error(result?.message || "Something went wrong. Please try again.");
      }

      setStatus("success");
      setMessage("You're on The Free List. Watch for the next drop.");
      setForm({ email: "", phone: "", favoritePlatform: "", companyWebsite: "" });
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <section id="free-list" className="section-shell relative">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <SectionHeader
          eyebrow="The Free List"
          title="Join The Free List."
          subtitle="Get early drops, behind-the-scenes stories, unreleased previews, merch alerts, release updates, and first access to what DFB Sound is building next."
        />
        <motion.form
          onSubmit={handleSubmit}
          className="glass-panel grid gap-4 p-4 sm:p-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <label className="field-label">
            Email
            <input
              name="email"
              type="email"
              maxLength={200}
              required
              value={form.email}
              onChange={handleChange}
              className="field-control"
              autoComplete="email"
            />
          </label>
          <label className="field-label">
            Phone optional
            <input
              name="phone"
              type="tel"
              maxLength={50}
              value={form.phone}
              onChange={handleChange}
              className="field-control"
              autoComplete="tel"
            />
          </label>
          <label className="field-label">
            Favorite platform optional
            <select
              name="favoritePlatform"
              value={form.favoritePlatform}
              onChange={handleChange}
              className="field-control"
            >
              <option value="">Select a platform</option>
              {favoritePlatforms.map((platform) => (
                <option key={platform}>{platform}</option>
              ))}
            </select>
          </label>
          <input
            type="text"
            name="companyWebsite"
            value={form.companyWebsite}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-9999px",
              opacity: 0,
              height: 0,
              width: 0,
            }}
          />
          <button type="submit" className="btn-primary justify-center" disabled={status === "submitting"}>
            <Send size={18} aria-hidden="true" />
            {status === "submitting" ? "Joining..." : "Join The Free List"}
          </button>
          {message && (
            <p
              className={
                status === "success"
                  ? "border border-signal/40 bg-signal/10 px-4 py-3 text-sm font-bold text-emerald-100"
                  : "border border-heat/45 bg-heat/10 px-4 py-3 text-sm font-bold text-orange-100"
              }
              role={status === "success" ? "status" : "alert"}
            >
              {message}
            </p>
          )}
        </motion.form>
      </div>
    </section>
  );
}

function VaultPreview() {
  return (
    <section className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeader
          eyebrow="Future Unlock"
          title="The Vault Is Coming."
          subtitle="Unreleased music, early demos, voice notes, behind-the-song drops, private videos, digital packs, and first access for The Free List."
          align="center"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vaultItems.map((item, index) => (
            <motion.article
              key={item}
              className="receipt-card min-h-0"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
            >
              <LockKeyhole className="text-heat" size={19} aria-hidden="true" />
              <h3 className="mt-7 font-display text-xl font-black uppercase leading-none text-white">
                {item}
              </h3>
            </motion.article>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a href="#free-list" className="btn-primary">
            <Mail size={18} aria-hidden="true" />
            Join The Free List For Access
          </a>
        </div>
      </div>
    </section>
  );
}

function VideosReleases() {
  return (
    <section className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeader eyebrow="Catalog" title="Videos & Releases" align="center" />
        <div className="grid gap-4 md:grid-cols-2">
          {releases.map((release, index) => (
            <ReleaseCard key={release.title} release={release} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReleaseCard({ release, index }) {
  const buttons = [
    ["Watch", release.youtubeUrl, Play],
    ["Spotify", release.spotifyUrl, Headphones],
    ["Apple Music", release.appleMusicUrl, Headphones],
    ["YouTube Music", release.youtubeMusicUrl, Video],
  ].filter(([, url]) => hasLink(url));

  return (
    <motion.article
      className="project-card bg-gradient-to-br from-white/[0.09] to-black/30"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-heat">
            {release.type}
          </p>
          <h3 className="mt-2 font-display text-3xl font-black uppercase leading-none text-white">
            {release.title}
          </h3>
        </div>
        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-100">
          {release.status}
        </span>
      </div>
      <p className="text-sm leading-6 text-slate-300">{release.description}</p>
      <div className="mt-7 flex flex-wrap gap-2">
        {buttons.map(([label, url, Icon]) => (
          <a key={label} href={url} className="micro-cta" target="_blank" rel="noreferrer">
            <Icon size={15} aria-hidden="true" />
            {label}
          </a>
        ))}
      </div>
    </motion.article>
  );
}

function SupportSound() {
  const supportLinks = getSupportLinks();

  return (
    <section id="support" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="glass-panel grid gap-8 p-5 sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-signal">
              Direct Support
            </p>
            <h2 className="font-display text-3xl font-black uppercase leading-[0.95] text-white sm:text-5xl">
              Support The Sound Directly.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-300">
              Streaming helps, but direct support keeps the videos, sessions,
              visuals, and independent releases moving.
            </p>
          </div>
          {supportLinks.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {supportLinks.map(([label, url]) => (
                <a key={label} href={url} className="btn-secondary justify-center" target="_blank" rel="noreferrer">
                  <Coffee size={18} aria-hidden="true" />
                  {label}
                </a>
              ))}
            </div>
          ) : (
            <div className="border border-white/10 bg-black/20 p-5 text-sm leading-6 text-slate-400">
              Direct support links will appear here when official DFB Sound
              links are added.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ArtistReleaseKit() {
  return (
    <section className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <SectionHeader
            eyebrow="Artist Release Kit"
            title="Need A Rollout For Your Own Music?"
            subtitle="DFB builds more than its own drops. Artists and creators can use the same system for release pages, short-form rollout content, cover direction, bios, links, visuals, and launch strategy."
          />
          <motion.div
            className="project-card bg-gradient-to-br from-signal/[0.11] via-white/[0.045] to-black/30"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <Sparkles className="text-signal" size={24} aria-hidden="true" />
              <span className="text-xs font-black uppercase tracking-[0.22em] text-signal">
                Artist Release Kit
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {releaseKitItems.map((item) => (
                <div
                  key={item}
                  className="border border-white/[0.08] bg-black/20 px-3 py-2 text-sm text-slate-300"
                >
                  {item}
                </div>
              ))}
            </div>
            <Link
              to="/#start-project?projectType=Music%20%2F%20Media"
              className="btn-primary mt-7"
            >
              <ArrowUpRight size={18} aria-hidden="true" />
              Build My Release Kit
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
