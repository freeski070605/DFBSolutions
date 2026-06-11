import SectionHeader from './SectionHeader.jsx';
import { html } from './utils.js';

const projectTypes = ['Photography / Visual Media', 'Branding / Content', 'Website / Landing Page', 'App / Digital Tool', 'Music / Media', 'AI Workflow', 'Other'];

export default function StartProjectCTA() {
  return html`<section id="start-project" class="section" aria-labelledby="start-heading"><div class="container"><div class="start-shell glass"><div class="start-copy">${SectionHeader({ eyebrow: 'Start A Project', title: 'Got An Idea Sitting In Your Notes?', subtitle: 'Bring the rough version. DFB helps shape it, brand it, build it, capture it, and turn it into something people can see, use, stream, book, or buy.' })}<div class="button-row stacked"><a class="btn primary" href="#start-project">Start A Project</a><a class="btn secondary" href="#media">Book Visual Work</a><a class="btn ghost" href="#builds">Explore Builds</a></div></div><form class="project-form" aria-label="Start a project form"><div class="form-grid two"><label>Name<input required name="name" /></label><label>Email<input required type="email" name="email" /></label></div><label>What do you need?<input name="need" /></label><div class="form-grid three"><label>Project type<select name="type">${projectTypes.map((type) => `<option>${type}</option>`).join('')}</select></label><label>Budget range<input name="budget" /></label><label>Timeline<input name="timeline" /></label></div><label>Message<textarea name="message" rows="5"></textarea></label><button class="btn primary" type="submit">Send Message →</button><p class="form-success" hidden>Message captured. Connect this form to your backend or email service next.</p></form></div></div></section>`;
}

export function initStartProjectForm() {
  const form = document.querySelector('.project-form');
  const success = document.querySelector('.form-success');
  if (!form || !success) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    form.reset();
    success.hidden = false;
  });
}
