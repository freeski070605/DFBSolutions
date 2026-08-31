import { useEffect } from "react";

const siteName = "DFB Solutions";
const defaultDescription = "DFB Solutions provides professional photography, film, brand content, websites, apps, and digital systems, with additional transportation and property solutions.";

export default function Seo({ title, description = defaultDescription, image, canonical, noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | Every Problem Has a Solution`;
    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", window.location.href);
    if (image) setMeta("property", "og:image", new URL(image, window.location.origin).href);
    setLink("canonical", canonical ? new URL(canonical, window.location.origin).href : `${window.location.origin}${window.location.pathname}`);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
  }, [title, description, image, canonical, noindex]);

  return null;
}

function setLink(rel, href) {
  let node = document.head.querySelector(`link[rel="${rel}"]`);
  if (!node) { node = document.createElement("link"); node.rel = rel; document.head.appendChild(node); }
  node.href = href;
}

function setMeta(attribute, key, content) {
  let node = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attribute, key);
    document.head.appendChild(node);
  }
  node.setAttribute("content", content);
}
