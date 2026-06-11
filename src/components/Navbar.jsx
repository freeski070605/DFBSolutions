import { html } from './utils.js';

const navItems = [['Home', '#home'], ['Work With Us', '#services'], ['Builds', '#builds'], ['Lab', '#lab'], ['Media', '#media'], ['Sound', '#sound'], ['Start Project', '#start-project']];

export default function Navbar() {
  return html`<header class="site-header">
    <nav class="container nav" aria-label="Main navigation">
      <a href="#home" class="brand-mark" aria-label="DFB Solutions home"><span>DFB</span><strong>Solutions<small>HQ Live</small></strong></a>
      <div class="desktop-nav">${navItems.map(([label, href]) => `<a href="${href}">${label}</a>`).join('')}</div>
      <button class="menu-toggle" type="button" aria-label="Toggle mobile menu" aria-expanded="false">☰</button>
    </nav>
    <div class="mobile-nav container" hidden>${navItems.map(([label, href]) => `<a href="${href}">${label}</a>`).join('')}</div>
  </header>`;
}

export function initNavbar() {
  const button = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-nav');
  if (!button || !menu) return;
  button.addEventListener('click', () => {
    const open = menu.hasAttribute('hidden');
    menu.toggleAttribute('hidden', !open);
    button.setAttribute('aria-expanded', String(open));
    button.textContent = open ? '×' : '☰';
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menu.setAttribute('hidden', '');
    button.setAttribute('aria-expanded', 'false');
    button.textContent = '☰';
  }));
}
