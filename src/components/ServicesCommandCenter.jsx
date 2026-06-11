import { services } from '../data/services.js';
import SectionHeader from './SectionHeader.jsx';
import ServiceCard from './ServiceCard.jsx';
import { html } from './utils.js';

export default function ServicesCommandCenter() {
  return html`<section id="services" class="section" aria-labelledby="services-heading"><div class="container">
    ${SectionHeader({ eyebrow: 'Work With Us', title: 'Creative Services Without The Cookie-Cutter Feel.', subtitle: 'Pick a module, bring the rough version, and let the DFB Control Room shape it into an asset with purpose.' })}
    <div class="selector-shell glass"><div class="selector-bar"><span>Service Selector</span><span>No stock menu // custom modules</span></div><div class="service-grid">${services.map(ServiceCard).join('')}</div></div>
  </div></section>`;
}
