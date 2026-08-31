import { ArrowRight, Camera, Code2, Hammer, Route } from "lucide-react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { useContent } from "../context/ContentContext.jsx";

export default function AboutPage() {
  const { siteContent } = useContent();
  const about = siteContent.about;
  return (
    <main id="top">
      <Seo title="About" description={about.intro} image={about.heroMedia?.src} />
      <section className="page-hero about-hero section">
        <div><p className="eyebrow">Why DFB exists</p><h1>{about.headline}</h1></div>
        <p>{about.intro}</p>
      </section>
      {about.heroMedia?.src && <section className="section about-media"><img src={about.heroMedia.src} alt={about.heroMedia.alt || "DFB Solutions"} /></section>}
      <section className="section about-story">
        <p className="section-number">01 / The belief</p>
        <div>
          <h2>Creative work and digital products belong in the same conversation.</h2>
          <p>{about.story}</p>
          <p>Photography, film, brand content, and digital products are the center of DFB. Transportation and Property remain practical additional solutions under the same promise: Every Problem Has a Solution.</p>
        </div>
      </section>
      <section className="section mission-panel">
        <div className="mission-tools" aria-hidden="true"><Code2 /><Camera /><Hammer /><Route /></div>
        <blockquote>“{about.mission}”</blockquote>
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
