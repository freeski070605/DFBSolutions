import { chips, html } from './utils.js';

export default function ServiceCard(service) {
  return html`<article class="service-card glass reveal">
    <div class="module-top"><span class="icon">${service.icon}</span><b>${service.signal}</b></div>
    <h3>${service.title}</h3><p>${service.description}</p><div class="chip-wrap">${chips(service.items)}</div>
    <a href="#start-project" class="micro-link">Request this →</a>
  </article>`;
}
