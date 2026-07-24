const routes = [
  "/",
  "/solutions/digital",
  "/solutions/creative",
  "/solutions/property",
  "/solutions/transportation",
  "/work",
  "/work/reemteam",
  "/work/mah-booking",
  "/work/divine-design-decor",
  "/work/love-is-rage",
  "/work/tasktracer",
  "/work/wedding-coverage",
  "/work/prom-coverage",
  "/work/sports-video",
  "/work/music-video",
  "/work/deck-platforms",
  "/work/drywall-repair",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
];

export default function handler(req, res) {
  const host = firstHeader(req.headers?.["x-forwarded-host"]) || req.headers?.host;
  const forwardedProtocol = firstHeader(req.headers?.["x-forwarded-proto"]);
  const protocol = forwardedProtocol || (host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https");
  const origin = `${protocol}://${host || "localhost"}`;
  const urls = routes.map((route) => `  <url><loc>${escapeXml(`${origin}${route}`)}</loc></url>`).join("\n");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=86400");
  return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
}

function firstHeader(value) {
  return typeof value === "string" ? value.split(",")[0].trim() : "";
}

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}
