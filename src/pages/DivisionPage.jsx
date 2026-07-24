import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Navigate, Link, useParams } from "react-router-dom";
import FaqList from "../components/FaqList.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import Seo from "../components/Seo.jsx";
import { useDivisions } from "../context/DivisionsContext.jsx";
import { useProjects } from "../context/ProjectsContext.jsx";

export default function DivisionPage() {
  const { slug } = useParams();
  const { divisions } = useDivisions();
  const division = divisions.find((item) => item.slug === slug);
  const { projects } = useProjects();
  if (!division) return <Navigate to="/404" replace />;
  const Icon = division.icon;
  const work = projects.filter((project) => project.division === division.slug);

  return (
    <main id="top" style={{ "--page-accent": division.accent }}>
      <Seo title={division.name} description={division.intro} />
      <section className="page-hero division-hero section">
        <div>
          <p className="eyebrow">{division.name}</p>
          <h1>{division.statement}</h1>
          <p>{division.intro}</p>
          <Link className="btn btn-primary" to={`/contact?type=${division.slug}`}>Discuss your project <ArrowRight size={17} /></Link>
        </div>
        <div className="division-emblem"><Icon size={54} /><span>{division.shortName}</span><small>DFB Solution Division</small></div>
      </section>

      <section className="section split-section">
        <div><p className="eyebrow">Problems we solve</p><h2>Start with the friction, not the service list.</h2></div>
        <div className="problem-list">{division.problems.map((problem, index) => <div key={problem}><span>0{index + 1}</span><p>{problem}</p></div>)}</div>
      </section>

      <section className="section capabilities-section">
        <div className="section-heading"><div><p className="eyebrow">Capabilities</p><h2>Tools selected around the outcome.</h2></div><p>Every engagement begins with fit and scope. These are the practical ways this division can help.</p></div>
        <div className="capability-grid">{division.capabilities.map((item) => <span key={item}><CheckCircle2 size={17} />{item}</span>)}</div>
      </section>

      <section className="section division-work">
        <div className="section-heading"><div><p className="eyebrow">Relevant proof</p><h2>{work.length ? "Work from this division." : "A capability built around the itinerary."}</h2></div></div>
        {work.length ? <div className="project-grid">{work.slice(0, 3).map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}</div> :
          <div className="honest-empty"><Icon size={34} /><div><h3>Transportation requests are planned case by case.</h3><p>There are no public customer trip records displayed. Share your date, group size, pickup city, destination, and known stops to begin a private itinerary review.</p></div><Link className="btn btn-secondary" to="/contact?type=transportation">Plan a trip</Link></div>}
      </section>

      <section className="section division-process">
        <div><p className="eyebrow">The approach</p><h2>A process shaped for {division.shortName.toLowerCase()} work.</h2></div>
        <ol>{division.process.map((step, index) => <li key={step}><span>0{index + 1}</span><p>{step}</p></li>)}</ol>
      </section>

      <section className="section faq-section"><div><p className="eyebrow">Good questions</p><h2>What to know before we begin.</h2></div><FaqList items={division.faqs} /></section>

      <section className="section mini-cta"><div><p className="eyebrow">{division.name}</p><h2>Bring us the need. We’ll help define the solution.</h2></div><Link className="btn btn-primary" to={`/contact?type=${division.slug}`}>Start the conversation <ArrowRight size={17} /></Link></section>
    </main>
  );
}
