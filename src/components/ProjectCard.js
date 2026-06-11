import StatusPill from './StatusPill.js';
import { chips, html } from './utils.js';

export default function ProjectCard(project, index = 0) {
  const tone = ['green', 'blue', 'amber'][index % 3];
  return html`<article class="project-card glass reveal"><div class="project-meta"><span>${project.category}</span>${StatusPill(project.status, tone)}</div><h3>${project.title}</h3><p>${project.description}</p><div class="chip-wrap">${chips(project.tags)}</div><a href="#start-project" class="project-link">View Build ↗</a></article>`;
}
