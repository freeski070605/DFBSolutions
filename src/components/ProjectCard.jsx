import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { divisionLabels } from "../data/projects.js";

export default function ProjectCard({ project, index = 0 }) {
  return (
    <article className="project-tile group">
      <div className="project-visual" style={{ "--accent": project.accent }}>
        {project.coverImage && <img src={project.coverImage} alt={`${project.title} project cover`} loading="lazy" />}
        <span className="project-index">{String(index + 1).padStart(2, "0")}</span>
        {!project.coverImage && <div className="project-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>}
        <span className="project-category">{project.category}</span>
      </div>
      <div className="project-body">
        <p className="eyebrow" style={{ color: project.accent }}>{divisionLabels[project.division]} solution</p>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <Link className="text-link" to={`/work/${project.slug}`}>
          View project <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
