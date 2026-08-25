import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = Object.fromEntries(await Promise.all([
  "src/App.jsx",
  "src/pages/GalleryPage.jsx",
  "src/components/gallery/EventGallery.jsx",
  "src/components/admin/AdminGalleriesPanel.jsx",
  "src/utils/galleryApi.js",
  "src/components/Footer.jsx",
].map(async (path) => [path, await readFile(new URL(`../${path}`, import.meta.url), "utf8")])));

assert.match(files["src/App.jsx"], /path="\/gallery"/);
assert.match(files["src/pages/GalleryPage.jsx"], /getGallerySession\(\)/);
assert.match(files["src/pages/GalleryPage.jsx"], /accessGallery\(submittedCode\)/);
assert.match(files["src/pages/GalleryPage.jsx"], /logoutGallery\(\)/);
assert.match(files["src/components/gallery/EventGallery.jsx"], /Your gallery is being prepared\./);
assert.match(files["src/components/admin/AdminGalleriesPanel.jsx"], /Event Galleries/);
assert.match(files["src/components/admin/AdminGalleriesPanel.jsx"], /Reset Event Code/);
assert.match(files["src/utils/galleryApi.js"], /\/api\/gallery\/access/);
assert.match(files["src/utils/galleryApi.js"], /\/api\/admin\/galleries/);
assert.match(files["src/components/Footer.jsx"], /to="\/gallery"/);

const browserSources = Object.entries(files)
  .filter(([path]) => path.startsWith("src/"))
  .map(([, source]) => source)
  .join("\n");

assert.doesNotMatch(files["src/pages/GalleryPage.jsx"], /localStorage|sessionStorage|URLSearchParams|location\.search/);
assert.doesNotMatch(browserSources, /R2_(ACCESS_KEY_ID|SECRET_ACCESS_KEY)|GALLERY_(CODE_PEPPER|SESSION_SECRET)/);
assert.doesNotMatch(browserSources, /(VITE_|NEXT_PUBLIC_|PUBLIC_)R2_/);

console.log("Phase 3 gallery UI validation passed.");
