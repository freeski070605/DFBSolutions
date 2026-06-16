import { projects } from "../data/projects.js";
import ProjectCard from "./ProjectCard.jsx";
import SectionHeader from "./SectionHeader.jsx";

export default function FeaturedBuilds() {
  return (
    <section id="featured-builds" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Featured Builds"
          title="Original Builds. Real Systems. Bigger Than Ideas."
          subtitle="These are DFB-driven products, platforms, and concepts built or developed under the brand direction."
          align="center"
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
