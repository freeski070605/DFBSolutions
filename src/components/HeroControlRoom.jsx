import { heroStatuses } from '../data/projects.js';
import StatusPill from './StatusPill.jsx';
import { html } from './utils.js';

export default function HeroControlRoom() {
  return html`<section id="home" class="hero section" aria-labelledby="hero-title">
    <div class="container hero-grid">
      <div class="hero-copy reveal">
        ${StatusPill('DFB SOLUTIONS // CREATIVE-TECH STUDIO', 'blue')}
        <h1 id="hero-title">Where Ideas Become Assets.</h1>
        <p>DFB Solutions helps people turn moments, brands, businesses, music, apps, and raw ideas into professional digital assets built to be seen, used, streamed, booked, or bought.</p>
        <div class="button-row"><a class="btn primary" href="#start-project">Start A Project →</a><a class="btn secondary" href="#builds">Explore The Builds</a><a class="btn ghost" href="#lab">Enter The Lab</a></div>
      </div>
      <div class="control-panel glass reveal">
        <div class="system-strip"><strong>⌁ DFB HQ LIVE</strong><span>ASSET PIPELINE // ONLINE</span></div>
        <div class="status-grid">${heroStatuses.map(([tag, name], index) => html`<article class="status-card float-${index % 4}"><div><span>${tag}</span><i></i></div><h3>${name}</h3><p>Queued inside the control room.</p></article>`).join('')}</div>
      </div>
    </div>
  </section>`;
}
