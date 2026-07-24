import { ArrowDown, ArrowRight, Check, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard.jsx";
import Seo from "../components/Seo.jsx";
import SolutionFinder from "../components/SolutionFinder.jsx";
import { divisions } from "../data/divisions.js";
import { projects } from "../data/projects.js";

export default function HomePage() {
  return (
    <>
      <Seo />
      <main id="top">
        <section className="hero section">
          <div className="hero-copy">
            <p className="eyebrow">One company. Four solution divisions.</p>
            <h1>Every Problem<br />Has a <em>Solution.</em></h1>
            <p className="hero-intro">DFB Solutions builds digital products, produces creative content, improves properties, and coordinates transportation—bringing the right solution to the problem in front of us.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/#find-solution">Find My Solution <ArrowRight size={17} /></Link>
              <Link className="btn btn-secondary" to="/work">View Our Work</Link>
            </div>
          </div>
          <div className="hero-system" aria-label="Four connected DFB solution divisions">
            <div className="system-center"><span>Problem</span><strong>DFB.</strong><small>Right tool.<br />Right outcome.</small></div>
            {divisions.map((division, index) => {
              const Icon = division.icon;
              return <Link to={`/solutions/${division.slug}`} key={division.slug} className={`system-node node-${index + 1}`} style={{ "--accent": division.accent }}>
                <Icon size={21} aria-hidden="true" /><span>0{index + 1}</span><strong>{division.shortName}</strong>
              </Link>;
            })}
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
          </div>
          <a className="scroll-cue" href="#philosophy"><ArrowDown size={16} /> Our approach</a>
        </section>

        <section className="philosophy section" id="philosophy">
          <p className="section-number">01 / Our philosophy</p>
          <div>
            <h2>We do not specialize in one service. <span>We specialize in solving problems.</span></h2>
            <p>Sometimes the answer is software. Sometimes it is a camera, a repair, or a carefully planned ride. The tool changes. The mission does not.</p>
          </div>
        </section>

        <section className="section solution-section">
          <div className="section-heading">
            <div><p className="eyebrow">Choose your solution</p><h2>Start with what you need to move forward.</h2></div>
            <p>Each division is focused. Together, they give DFB the range to approach a problem from the right angle.</p>
          </div>
          <div className="division-grid">
            {divisions.map((division, index) => {
              const Icon = division.icon;
              return (
                <Link className="division-card" key={division.slug} to={`/solutions/${division.slug}`} style={{ "--accent": division.accent }}>
                  <div className="division-top"><span>0{index + 1}</span><Icon size={25} /></div>
                  <h3>{division.shortName}</h3>
                  <p>{division.prompt}</p>
                  <span className="text-link">Explore {division.name} <ArrowRight size={16} /></span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="section finder-section" id="find-solution">
          <SolutionFinder />
        </section>

        <section className="section featured-section">
          <div className="section-heading">
            <div><p className="eyebrow">Featured solutions</p><h2>Proof in the work.</h2></div>
            <Link className="text-link" to="/work">Explore all work <ArrowRight size={16} /></Link>
          </div>
          <div className="project-grid">
            {projects.filter((project) => project.featured).slice(0, 3).map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}
          </div>
        </section>

        <section className="section process-section">
          <div className="process-intro"><p className="eyebrow">How DFB solves problems</p><h2>A clear method.<br />A flexible toolset.</h2><p>The work changes across divisions. The standard and the thinking behind it stay consistent.</p></div>
          <ol className="process-list">
            {[
              ["Discover", "Understand the problem, goal, audience, and constraints."],
              ["Design", "Determine the most effective solution and plan the work."],
              ["Build", "Create, produce, repair, or coordinate the solution."],
              ["Deliver", "Launch, complete, hand off, or execute the finished work."],
              ["Support", "Provide the right next-step support for the project type."],
            ].map(([title, copy], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}
          </ol>
        </section>

        <section className="section standards-section">
          <div><p className="eyebrow">Different problems. One standard.</p><h2>Capability is only useful when it comes with clarity.</h2></div>
          <div className="standards-list">
            {["Clear communication", "Thoughtful planning", "Professional execution", "Custom solutions", "Reliable delivery"].map((item) => <span key={item}><Check size={16} /> {item}</span>)}
          </div>
          <div className="standard-seal"><Compass size={38} /><strong>The right path starts with the real problem.</strong></div>
        </section>

        <section className="section final-cta">
          <p className="eyebrow">Start wherever you are</p>
          <h2>Tell us the problem.<br /><em>Let’s build the solution.</em></h2>
          <p>You do not need to know the technical name for what you need. Explain what is happening, what should be better, and where you want to go.</p>
          <div><Link className="btn btn-primary" to="/contact">Start a Project <ArrowRight size={17} /></Link><Link className="btn btn-secondary" to="/#find-solution">Find My Solution</Link></div>
        </section>
      </main>
    </>
  );
}
