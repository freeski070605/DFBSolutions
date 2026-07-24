import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import ProjectCard from "../components/ProjectCard.jsx";
import Seo from "../components/Seo.jsx";
import { divisionLabels, getProject, projects } from "../data/projects.js";

export default function ProjectPage() {
  const { slug } = useParams();
  const project = getProject(slug);
  if (!project) return <Navigate to="/404" replace />;
  const related = projects.filter((item) => item.division === project.division && item.slug !== project.slug).slice(0, 2);
  return (
    <main id="top" style={{ "--page-accent": project.accent }}>
      <Seo title={project.title} description={project.summary} />
      <section className="project-hero section">
        <Link className="back-link" to="/work"><ArrowLeft size={15} /> All work</Link>
        <div className="project-title"><p className="eyebrow">{divisionLabels[project.division]} / {project.category}</p><h1>{project.title}</h1><p>{project.summary}</p></div>
        <div className="project-stage" aria-hidden="true"><span>DFB / {divisionLabels[project.division]}</span><strong>{project.title.slice(0, 2).toUpperCase()}</strong><i /></div>
      </section>
      <section className="section case-overview">
        <div><p className="eyebrow">The problem</p><h2>{project.problem}</h2></div>
        <div><p className="eyebrow">The solution</p><p>{project.solution}</p></div>
      </section>
      <section className="section deliverables">
        <div><p className="eyebrow">What DFB delivered</p><h2>A focused solution, shaped to fit.</h2></div>
        <ul>{project.deliverables.map((item) => <li key={item}><Check size={17} />{item}</li>)}</ul>
        {project.features && <div className="feature-block"><h3>Platform features</h3>{project.features.map((item) => <span key={item}>{item}</span>)}</div>}
      </section>
      {related.length > 0 && <section className="section related-work"><div className="section-heading"><div><p className="eyebrow">Related work</p><h2>More from {divisionLabels[project.division]}.</h2></div></div><div className="project-grid">{related.map((item, index) => <ProjectCard key={item.slug} project={item} index={index} />)}</div></section>}
      <section className="section mini-cta"><div><p className="eyebrow">Have a related problem?</p><h2>Let’s figure out the right way to solve it.</h2></div><Link className="btn btn-primary" to={`/contact?type=${project.division}`}>Start a conversation <ArrowRight size={17} /></Link></section>
    </main>
  );
}
