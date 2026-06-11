import SectionHeader from './SectionHeader.js';
import { html } from './utils.js';

const media = ['Wedding & event photography', 'Brand visuals', 'Portraits', 'Promo shoots', 'Product/lifestyle content', 'Video/photo direction'];

export default function MediaSection() {
  return html`<section id="media" class="section" aria-labelledby="media-heading"><div class="container">${SectionHeader({ eyebrow: 'Media / Visual Work', title: 'Media That Feels Like The Brand, Not Just A Camera Roll.', subtitle: 'Visual work comes before the music here because the front door is DFB Solutions: moments, campaigns, products, people, and the look around the idea.' })}<div class="media-grid">${media.map((item, index) => html`<article class="media-card media-${index} reveal" role="img" aria-label="${item} abstract visual placeholder"><div><span>◉</span><h3>${item}</h3></div></article>`).join('')}</div><a class="btn primary media-cta" href="#start-project">Book Visual Work</a></div></section>`;
}
