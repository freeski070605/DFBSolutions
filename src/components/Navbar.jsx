import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { divisions } from "../data/divisions.js";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    setOpen(false);
    setSolutionsOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
        setSolutionsOpen(false);
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (solutionsOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        setSolutionsOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [solutionsOpen]);

  const baseLinks = [["Home", "/"], ["Our Work", "/work"], ["About", "/about"], ["Contact", "/contact"]];

  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Primary navigation">
        <Link className="brand" to="/" aria-label="DFB Solutions home">
          <span className="brand-symbol">DFB<span>.</span></span>
          <span className="brand-text">Solutions<small>Built around the problem</small></span>
        </Link>
        <div className="desktop-nav">
          <NavLink to="/" end>Home</NavLink>
          <div className="solutions-menu" ref={menuRef}>
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={solutionsOpen}
              onClick={() => setSolutionsOpen((value) => !value)}
            >
              Solutions <ChevronDown size={15} />
            </button>
            <AnimatePresence>
              {solutionsOpen && (
                <motion.div className="solutions-dropdown" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                  <p>Choose a path</p>
                  {divisions.map((division) => (
                    <Link key={division.slug} to={`/solutions/${division.slug}`}>
                      <span style={{ background: division.accent }} />
                      <div><strong>{division.name}</strong><small>{division.statement}</small></div>
                    </Link>
                  ))}
                  <Link className="dropdown-finder" to="/#find-solution">Not sure? Find my solution →</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {baseLinks.slice(1).map(([label, path]) => <NavLink key={path} to={path}>{label}</NavLink>)}
        </div>
        <Link className="btn btn-primary nav-cta" to="/#find-solution">Find My Solution</Link>
        <button className="menu-toggle" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div className="mobile-nav" initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}>
            <NavLink to="/" end>Home</NavLink>
            <p>Solutions</p>
            {divisions.map((division) => <NavLink className="mobile-solution" key={division.slug} to={`/solutions/${division.slug}`}>{division.name}</NavLink>)}
            {baseLinks.slice(1).map(([label, path]) => <NavLink key={path} to={path}>{label}</NavLink>)}
            <Link className="btn btn-primary" to="/#find-solution">Find My Solution</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
