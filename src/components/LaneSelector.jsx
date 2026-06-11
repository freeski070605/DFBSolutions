import { lanes } from '../data/services.js';
import SectionHeader from './SectionHeader.jsx';
import { html } from './utils.js';

export default function LaneSelector() {
  return html`<section class="section" aria-labelledby="lanes-heading"><div class="container">
    ${SectionHeader({ eyebrow: 'Choose Your Lane', title: 'What Do You Need Built?', subtitle: 'Whether you came for a service, a system, a project, or the sound, DFB gives every idea a lane.', align: 'center' })}
    <div class="lane-grid">${lanes.map((lane, index) => html`<a class="lane-card glass ${lane.accent} reveal" href="${lane.href}"><span>Lane 0${index + 1}</span><h3>${lane.title}</h3><p>${lane.subtitle}</p><strong>${lane.cta} ↗</strong></a>`).join('')}</div>
  </div></section>`;
}
