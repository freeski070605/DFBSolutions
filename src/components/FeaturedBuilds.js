import { projects } from '../data/projects.js';
import ProjectCard from './ProjectCard.js';
import SectionHeader from './SectionHeader.js';
import { html } from './utils.js';

export default function FeaturedBuilds() {
  return html`<section id="builds" class="section" aria-labelledby="builds-heading"><div class="container">${SectionHeader({ eyebrow: 'Featured Builds', title: 'Original Builds. Real Systems. Bigger Than Ideas.', subtitle: 'These are DFB-driven products, platforms, and concepts built or developed under the brand direction.' })}<div class="project-grid">${projects.map(ProjectCard).join('')}</div></div></section>`;
}
