import { useEffect } from "react";

const siteName = "DFB Solutions";
const defaultDescription = "DFB Solutions builds digital products, produces creative content, improves properties, and coordinates transportation around the problem in front of us.";

export default function Seo({ title, description = defaultDescription }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | Every Problem Has a Solution`;
    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", window.location.href);
  }, [title, description]);

  return null;
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
