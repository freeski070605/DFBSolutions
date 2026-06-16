import { AnimatePresence, motion } from "framer-motion";
import { Menu, Rocket, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  ["Home", "#home"],
  ["Work With Us", "#services"],
  ["Builds", "#featured-builds"],
  ["Lab", "#lab"],
  ["Media", "#media"],
  ["Sound", "#sound"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/72 backdrop-blur-xl">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <a href="#home" className="focus-ring group flex items-center gap-3 rounded-lg">
          <span className="grid h-10 w-10 place-items-center border border-white/15 bg-white/10 font-display text-sm font-black text-white shadow-glow">
            DFB
          </span>
          <span>
            <span className="block font-display text-sm font-black uppercase tracking-[0.18em] text-white">
              DFB Solutions
            </span>
            <span className="block text-[0.68rem] uppercase tracking-[0.18em] text-slate-400">
              Creative-Tech Studio
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map(([label, href]) => (
            <a key={label} href={href} className="nav-link">
              {label}
            </a>
          ))}
        </div>

        <a href="#start-project" className="btn-primary hidden lg:inline-flex">
          <Rocket size={17} aria-hidden="true" />
          Start Project
        </a>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="focus-ring inline-grid h-11 w-11 place-items-center rounded-lg border border-white/15 bg-white/10 text-white lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="overflow-hidden border-t border-white/10 bg-graphite/96 lg:hidden"
          >
            <div className="mx-auto grid max-w-7xl gap-2 px-4 py-4 sm:px-6">
              {navItems.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="focus-ring rounded-lg px-3 py-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-200 hover:bg-white/10"
                >
                  {label}
                </a>
              ))}
              <a
                href="#start-project"
                onClick={() => setOpen(false)}
                className="btn-primary mt-2 justify-center"
              >
                <Rocket size={17} aria-hidden="true" />
                Start Project
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
