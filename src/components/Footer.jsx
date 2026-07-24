import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { divisions } from "../data/divisions.js";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-lead">
        <p className="eyebrow">Have a problem, project, idea, or need?</p>
        <h2>Tell us what needs to move forward.</h2>
        <Link className="btn btn-primary" to="/contact">Start a project <ArrowUpRight size={17} /></Link>
      </div>
      <div className="footer-grid">
        <div>
          <Link className="brand footer-brand" to="/"><span className="brand-symbol">DFB<span>.</span></span><span className="brand-text">Solutions</span></Link>
          <p>Every Problem Has a Solution.</p>
          <small>The tool changes. The mission does not.</small>
        </div>
        <div>
          <h3>Solutions</h3>
          {divisions.map((division) => <Link key={division.slug} to={`/solutions/${division.slug}`}>{division.name}</Link>)}
        </div>
        <div>
          <h3>Company</h3>
          <Link to="/work">Our Work</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/sound">DFB Sound</Link>
        </div>
        <div>
          <h3>Information</h3>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} DFB Solutions.</span><span>Built around the problem.</span></div>
    </footer>
  );
}
