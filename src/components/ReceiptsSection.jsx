import { stats } from '../data/stats.js';
import SectionHeader from './SectionHeader.jsx';
import { html } from './utils.js';

export default function ReceiptsSection() {
  return html`<section class="section receipts" aria-labelledby="receipts-heading"><div class="container">${SectionHeader({ eyebrow: 'Proof System', title: 'Receipts Over Resumes.', subtitle: 'DFB is built on proof of creation — not empty titles.', align: 'center' })}<div class="receipt-grid">${stats.map((stat) => html`<article class="receipt-card glass reveal"><span>✓</span><p>${stat.label}</p><h3>${stat.proof}</h3></article>`).join('')}</div></div></section>`;
}
