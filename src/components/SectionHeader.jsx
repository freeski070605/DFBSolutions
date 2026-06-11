import { html } from './utils.js';

export default function SectionHeader({ eyebrow, title, subtitle, align = 'left' }) {
  return html`<div class="section-header ${align === 'center' ? 'center' : ''} reveal">
    ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
    <h2>${title}</h2>
    ${subtitle ? `<p class="section-subtitle">${subtitle}</p>` : ''}
  </div>`;
}
