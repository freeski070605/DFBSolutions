import { labItems } from '../data/labItems.js';
import SectionHeader from './SectionHeader.js';
import { html } from './utils.js';

export default function LabSection() {
  return html`<section id="lab" class="section lab-section" aria-labelledby="lab-heading"><div class="container">${SectionHeader({ eyebrow: 'The Lab', title: 'The Lab Is Where The Wild Ideas Get Built.', subtitle: 'Some ideas are client work. Some are products. Some are experiments that turn into the next wave.' })}<div class="lab-grid">${labItems.map((item) => html`<article class="lab-card glass reveal"><span class="lab-icon">⚗</span><p>${item.label}</p><h3>${item.title}</h3><b>${item.phase}</b></article>`).join('')}</div></div></section>`;
}
