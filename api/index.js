import bootstrap from "../server/api/auth/bootstrap.js";
import login from "../server/api/auth/login.js";
import logout from "../server/api/auth/logout.js";
import session from "../server/api/auth/session.js";
import projectsAdmin from "../server/api/admin/projects.js";
import divisionsAdmin from "../server/api/admin/divisions.js";
import inquiriesAdmin from "../server/api/admin/inquiries.js";
import customersAdmin from "../server/api/admin/customers.js";
import bookingsAdmin from "../server/api/admin/bookings.js";
import overview from "../server/api/admin/overview.js";
import seed from "../server/api/admin/seed.js";
import projectsPublic from "../server/api/content/projects.js";
import divisionsPublic from "../server/api/content/divisions.js";
import contact from "../server/api/contact.js";
import joinFreeList from "../server/api/join-free-list.js";
import robots from "../server/api/robots.js";
import sitemap from "../server/api/sitemap.js";

const routes = {
  "auth/bootstrap": bootstrap,
  "auth/login": login,
  "auth/logout": logout,
  "auth/session": session,
  "admin/projects": projectsAdmin,
  "admin/divisions": divisionsAdmin,
  "admin/inquiries": inquiriesAdmin,
  "admin/customers": customersAdmin,
  "admin/bookings": bookingsAdmin,
  "admin/overview": overview,
  "admin/seed": seed,
  "content/projects": projectsPublic,
  "content/divisions": divisionsPublic,
  contact,
  "join-free-list": joinFreeList,
  robots,
  sitemap,
};

export default async function handler(req, res) {
  const routeValue = Array.isArray(req.query?.route) ? req.query.route.join("/") : req.query?.route;
  const route = String(routeValue || "").replace(/^\/+|\/+$/g, "");
  const routeHandler = routes[route];
  if (!routeHandler) return res.status(404).json({ success: false, message: "API route not found." });

  try {
    return await routeHandler(req, res);
  } catch (error) {
    console.error("Consolidated API route failed.", { route, message: error?.message });
    if (!res.headersSent) return res.status(500).json({ success: false, message: "The request could not be completed." });
  }
}
