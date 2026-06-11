import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import App from '../src/App.js';

const template = await readFile('index.html', 'utf8');
const appMarkup = App();
const hydrationScript = String.raw`<script>
  document.documentElement.classList.add('motion-ready');

  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-nav');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const open = mobileMenu.hasAttribute('hidden');
      mobileMenu.toggleAttribute('hidden', !open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.textContent = open ? '×' : '☰';
    });
    mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      mobileMenu.setAttribute('hidden', '');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.textContent = '☰';
    }));
  }

  const projectForm = document.querySelector('.project-form');
  const successMessage = document.querySelector('.form-success');
  if (projectForm && successMessage) {
    projectForm.addEventListener('submit', (event) => {
      event.preventDefault();
      projectForm.reset();
      successMessage.hidden = false;
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
  }
</script>`;
const prerenderedHtml = template
  .replace(/<!--APP_HTML_START-->[\s\S]*?<!--APP_HTML_END-->/, `<!--APP_HTML_START-->${appMarkup}<!--APP_HTML_END-->`)
  .replace('<!--HYDRATION_SCRIPT-->', hydrationScript);

for (const outputDir of ['dist', 'public']) {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(`${outputDir}/src`, { recursive: true });
  await writeFile(`${outputDir}/index.html`, prerenderedHtml);
  await cp('src', `${outputDir}/src`, { recursive: true });
}
console.log('Built prerendered static DFB Solutions site into dist/ and public/');
import { cp, mkdir, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist/src', { recursive: true });
await cp('index.html', 'dist/index.html');
await cp('src', 'dist/src', { recursive: true });
console.log('Built static DFB Solutions site into dist/');
