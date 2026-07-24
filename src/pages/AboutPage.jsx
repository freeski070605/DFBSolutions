import { ArrowRight, Camera, Code2, Hammer, Route } from "lucide-react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function AboutPage() {
  return (
    <main id="top">
      <Seo title="About" description="DFB Solutions was built around a simple belief: understand the real need first, then choose or build the right solution." />
      <section className="page-hero about-hero section">
        <div><p className="eyebrow">Why DFB exists</p><h1>One mission.<br /><em>Whatever the tool.</em></h1></div>
        <p>DFB was built around the belief that people should not need five disconnected companies to move one idea or problem forward.</p>
      </section>
      <section className="section about-story">
        <p className="section-number">01 / The belief</p>
        <div>
          <h2>Understand the real need first.</h2>
          <p>A request often arrives as a service: “I need a website,” “I need a video,” or “I need a ride.” But the useful work begins one level deeper. Who is this for? What is getting in the way? What does a successful outcome actually need to do?</p>
          <p>DFB approaches each project by answering those questions, then selecting or building the right solution. That may mean a digital product, creative production, property work, or transportation logistics. The range is intentional because real problems do not always fit inside a single category.</p>
        </div>
      </section>
      <section className="section mission-panel">
        <div className="mission-tools" aria-hidden="true"><Code2 /><Camera /><Hammer /><Route /></div>
        <blockquote>“The tool changes.<br /><em>The mission does not.</em>”</blockquote>
        <p>Professional work starts with a clear problem, a thoughtful plan, and ownership of the result.</p>
      </section>
      <section className="section values-section">
        {[
          ["Listen before prescribing", "The right solution starts with context, not a preselected service."],
          ["Make complexity understandable", "Clear communication is part of the deliverable."],
          ["Build for the real world", "A solution has to work for the people, timing, and constraints around it."],
          ["Care about the finish", "Details shape whether the result feels complete, credible, and ready."],
        ].map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}
      </section>
      <section className="section final-cta"><p className="eyebrow">Bring us the starting point</p><h2>A problem. An idea.<br /><em>A need to move forward.</em></h2><p>You do not have to arrive with a perfect brief. Start with what you know.</p><div><Link className="btn btn-primary" to="/contact">Start a conversation <ArrowRight size={17} /></Link><Link className="btn btn-secondary" to="/work">See the work</Link></div></section>
    </main>
  );
}
