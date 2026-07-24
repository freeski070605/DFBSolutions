import { useMemo, useState } from "react";
import ProjectCard from "../components/ProjectCard.jsx";
import Seo from "../components/Seo.jsx";
import { projects } from "../data/projects.js";

const filters = ["all", "digital", "creative", "property", "transportation"];

export default function WorkPage() {
  const [filter, setFilter] = useState("all");
  const visible = useMemo(() => filter === "all" ? projects : projects.filter((project) => project.division === filter), [filter]);
  return (
    <main id="top">
      <Seo title="Our Work" description="Explore real DFB Solutions work across digital products, creative production, and property improvements." />
      <section className="page-hero compact-hero section"><div><p className="eyebrow">Our work</p><h1>Different problems.<br /><em>Purpose-built outcomes.</em></h1><p>Approved work only—presented around the problem, the solution, and what DFB delivered.</p></div></section>
      <section className="section work-gallery">
        <div className="filters" role="group" aria-label="Filter projects">
          {filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}
        </div>
        <p className="result-count" aria-live="polite">{visible.length} {visible.length === 1 ? "project" : "projects"}</p>
        {visible.length ? <div className="project-grid">{visible.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}</div> :
          <div className="honest-empty"><div><h2>Transportation work stays private.</h2><p>No customer trip details are published yet. Transportation requests are still available and planned around the group, occasion, route, and itinerary.</p></div><a className="btn btn-primary" href="/contact?type=transportation">Plan transportation</a></div>}
      </section>
    </main>
  );
}
