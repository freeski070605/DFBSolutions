import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const groups = {
  photo: { label: "Photo & Video", links: [["Photography", "/photography"], ["Videography", "/videography"], ["Weddings", "/weddings"], ["Events", "/events"], ["Sports Media", "/sports-media"], ["Music Videos", "/music-videos"], ["Brand Content", "/brand-content"]] },
  digital: { label: "Digital", links: [["Websites", "/websites"], ["Apps & Digital Tools", "/apps"], ["Branding & Design", "/branding"], ["Content Systems", "/brand-content"], ["Automation", "/apps"]] },
  more: { label: "More", links: [["Transportation", "/solutions/transportation"], ["Property", "/solutions/property"]] },
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState("");
  const location = useLocation();
  const menuRef = useRef(null);
  useEffect(() => { setOpen(false); setDropdown(""); }, [location.pathname, location.hash]);
  useEffect(() => { const key = (event) => event.key === "Escape" && (setOpen(false), setDropdown("")); document.addEventListener("keydown", key); return () => document.removeEventListener("keydown", key); }, []);
  useEffect(() => { const outside = (event) => dropdown && menuRef.current && !menuRef.current.contains(event.target) && setDropdown(""); document.addEventListener("pointerdown", outside); return () => document.removeEventListener("pointerdown", outside); }, [dropdown]);
  return <header className="site-header"><nav className="nav-shell" aria-label="Primary navigation">
    <Link className="brand" to="/" aria-label="DFB Solutions home"><span className="brand-symbol">DFB<span>.</span></span><span className="brand-text">Solutions<small>Photo · Video · Digital</small></span></Link>
    <div className="desktop-nav" ref={menuRef}><NavLink to="/" end>Home</NavLink>{Object.entries(groups).map(([key, group]) => <div className="solutions-menu" key={key}><button type="button" aria-haspopup="true" aria-expanded={dropdown === key} onClick={() => setDropdown(dropdown === key ? "" : key)}>{group.label} <ChevronDown size={15} /></button><AnimatePresence>{dropdown === key && <motion.div className={"solutions-dropdown compact-dropdown dropdown-" + key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><p>{group.label}</p>{group.links.map(([label, path]) => <Link key={label + path} to={path}><div><strong>{label}</strong></div></Link>)}</motion.div>}</AnimatePresence></div>)}<NavLink to="/work">Our Work</NavLink><NavLink to="/gallery">Client Gallery</NavLink></div>
    <Link className="btn btn-primary nav-cta" to="/contact">Book / Get a Quote</Link><button className="menu-toggle" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
  </nav><AnimatePresence>{open && <motion.div className="mobile-nav" initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}><NavLink to="/" end>Home</NavLink>{Object.values(groups).map((group) => <div className="mobile-nav-group" key={group.label}><p>{group.label}</p>{group.links.map(([label, path]) => <NavLink className="mobile-solution" key={label + path} to={path}>{label}</NavLink>)}</div>)}<NavLink to="/work">Our Work</NavLink><NavLink to="/gallery">Client Gallery</NavLink><NavLink to="/about">About</NavLink><Link className="btn btn-primary" to="/contact">Book / Get a Quote</Link></motion.div>}</AnimatePresence></header>;
}
