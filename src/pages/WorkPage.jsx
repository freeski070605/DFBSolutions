import { useMemo, useState } from "react";
import ProjectCard from "../components/ProjectCard.jsx";
import Seo from "../components/Seo.jsx";
import { useProjects } from "../context/ProjectsContext.jsx";

const filters = ["All", "Photography", "Video", "Weddings & Events", "Sports", "Music", "Brands", "Websites", "Apps & Platforms"];
function publicCategory(project) {
  const value = (project.category || "").toLowerCase();
  if (value.includes("wedding") || value.includes("event")) return "Weddings & Events";
  if (value.includes("athlete") || value.includes("sport")) return "Sports";
  if (value.includes("artist") || value.includes("music")) return "Music";
  if (value.includes("photo") || value.includes("portrait")) return "Photography";
  if (value.includes("video") || value.includes("film")) return "Video";
  if (value.includes("website")) return "Websites";
  if (value.includes("platform") || value.includes("app") || value.includes("workflow") || value.includes("digital experience")) return "Apps & Platforms";
  if (value.includes("brand")) return "Brands";
  return project.category;
}

export default function WorkPage() {
  const { projects } = useProjects();
  const [filter, setFilter] = useState("All");
  const visible = useMemo(() => filter === "All" ? projects : projects.filter((project) => publicCategory(project) === filter), [filter, projects]);
  return (
    <main id="top">
      <Seo title="Our Work" description="Explore DFB photography, video, brand, website, and app projects." />
      <section className="page-hero compact-hero section"><div><p className="eyebrow">Our work</p><h1>See the story.<br /><em>See the solution.</em></h1><p>Published client work presented around the goal, the craft, and what DFB delivered.</p></div></section>
      <section className="section work-gallery">
        <div className="filters" role="group" aria-label="Filter projects">
          {filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}
        </div>
        <p className="result-count" aria-live="polite">{visible.length} {visible.length === 1 ? "project" : "projects"}</p>
        {visible.length ? <div className="project-grid">{visible.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}</div> :
          <div className="honest-empty"><div><h2>No published work in this category yet.</h2><p>Only approved public projects appear here. Private gallery and customer details remain protected.</p></div></div>}
      </section>
    </main>
  );
}
