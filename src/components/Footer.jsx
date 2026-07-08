import { ArrowUpRight } from "lucide-react";

const explore = [
  ["Services", "/#services"],
  ["Work", "/#work"],
  ["Process", "/#process"],
  ["Start A Project", "/#start-project"],
  ["Sound", "/sound"],
];

const services = [
  "Digital Builds",
  "Photography",
  "Videography",
  "Music Videos",
  "Event Recaps",
  "Launch Systems",
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <h2 className="font-display text-2xl font-black uppercase text-white">
            DFB Solutions
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            DFB Solutions helps clients build it, capture it, and launch it.
          </p>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-signal">
            Websites. Apps. Visuals. Systems.
          </p>
        </div>
        <FooterLinks title="Explore" items={explore} />
        <FooterText title="Services" items={services} />
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
            Connect
          </h3>
          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-300">
            Use the project form to start a website, app, shoot, recap, promo video,
            content engine, or AI workflow.
          </p>
          <a href="#start-project" className="micro-cta mt-5">
            Send My Build Request
          </a>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-white/10 px-4 py-6 text-xs text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>&copy; {new Date().getFullYear()} DFB Solutions. Built from scratch.</p>
        <a href="#home" className="focus-ring inline-flex items-center gap-2 rounded text-slate-300 hover:text-white">
          Back to top <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}

function FooterLinks({ title, items }) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
        {title}
      </h3>
      <ul className="mt-4 grid gap-2">
        {items.map(([item, href]) => (
          <li key={item}>
            <a href={href} className="focus-ring inline-flex rounded text-sm text-slate-300 hover:text-white">
              {item}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterText({ title, items }) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
        {title}
      </h3>
      <ul className="mt-4 grid gap-2">
        {items.map((item) => (
          <li key={item} className="text-sm text-slate-300">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
