import { html } from './utils.js';

const explore = ['Work With Us', 'Builds', 'Lab', 'Media', 'Sound'];
const services = ['Photography', 'Branding', 'Content Packs', 'Landing Pages', 'Apps & Tools', 'AI Workflows'];
const connect = ['Email placeholder', 'Instagram placeholder', 'YouTube placeholder', 'TikTok placeholder'];
const list = (title, items) => html`<div><h3>${title}</h3><ul>${items.map((item) => `<li><a href="#start-project">${item}</a></li>`).join('')}</ul></div>`;

export default function Footer() {
  return html`<footer class="site-footer"><div class="container footer-grid"><div><h2>DFB Solutions</h2><p>Where Ideas Become Assets.</p><small>Street-Born. Studio-Built. Tech-Powered.</small></div>${list('Explore', explore)}${list('Services', services)}${list('Connect', connect)}</div><div class="container footer-bottom">DFB HQ // Creative-tech control room</div></footer>`;
}
