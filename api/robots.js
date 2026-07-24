export default function handler(req, res) {
  const host = firstHeader(req.headers?.["x-forwarded-host"]) || req.headers?.host;
  const forwardedProtocol = firstHeader(req.headers?.["x-forwarded-proto"]);
  const protocol = forwardedProtocol || (host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https");
  const origin = `${protocol}://${host || "localhost"}`;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=86400");
  return res.status(200).send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin\nDisallow: /api/auth\n\nSitemap: ${origin}/sitemap.xml\n`);
}

function firstHeader(value) {
  return typeof value === "string" ? value.split(",")[0].trim() : "";
}
