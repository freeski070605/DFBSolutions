import { ArrowUpRight } from "lucide-react";

const explore = ["Work With Us", "Builds", "Lab", "Media", "Sound"];
const services = [
  "Photography",
  "Branding",
  "Content Packs",
  "Landing Pages",
  "Apps & Tools",
  "AI Workflows",
];
const connect = ["Email placeholder", "Instagram placeholder", "YouTube placeholder", "TikTok placeholder"];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <h2 className="font-display text-2xl font-black uppercase text-white">
            DFB Solutions
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Where Ideas Become Assets.
          </p>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-signal">
            Street-Born. Studio-Built. Tech-Powered.
          </p>
        </div>
        <FooterColumn title="Explore" items={explore} />
        <FooterColumn title="Services" items={services} />
        <FooterColumn title="Connect" items={connect} />
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-white/10 px-4 py-6 text-xs text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>© {new Date().getFullYear()} DFB Solutions. Built from scratch.</p>
        <a href="#home" className="focus-ring inline-flex items-center gap-2 rounded text-slate-300 hover:text-white">
          Back to Creative Studio <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
        {title}
      </h3>
      <ul className="mt-4 grid gap-2">
        {items.map((item) => (
          <li key={item}>
            <a href="#" className="focus-ring inline-flex rounded text-sm text-slate-300 hover:text-white">
              {item}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
