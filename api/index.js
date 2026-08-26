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
import galleriesAdmin from "../server/api/admin/galleries.js";
import galleryPhotosAdmin from "../server/api/admin/gallery-photos.js";
import galleryUploadUrlsAdmin from "../server/api/admin/gallery-upload-urls.js";
import galleryUploadCompleteAdmin from "../server/api/admin/gallery-upload-complete.js";
import galleryAccess from "../server/api/gallery/access.js";
import galleryPhotos from "../server/api/gallery/photos.js";
import galleryDownload from "../server/api/gallery/download.js";
import galleryLogout from "../server/api/gallery/logout.js";
import gallerySession from "../server/api/gallery/session.js";
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
  "admin/galleries": galleriesAdmin,
  "admin/gallery-photos": galleryPhotosAdmin,
  "admin/gallery-upload-urls": galleryUploadUrlsAdmin,
  "admin/gallery-upload-complete": galleryUploadCompleteAdmin,
  "gallery/access": galleryAccess,
  "gallery/photos": galleryPhotos,
  "gallery/download": galleryDownload,
  "gallery/logout": galleryLogout,
  "gallery/session": gallerySession,
  "content/projects": projectsPublic,
  "content/divisions": divisionsPublic,
  contact,
  "join-free-list": joinFreeList,
  robots,
  sitemap,
};

export default async function handler(req, res) {
  const routeValue = queryValue(req.query?.route);
  const route = String(routeValue || "").replace(/^\/+|\/+$/g, "");
  const routeHandler = routes[route];
  if (!routeHandler) return res.status(404).json({ success: false, message: "API route not found." });

  req.query = applicationQuery(req.query, route);

  try {
    return await routeHandler(req, res);
  } catch (error) {
    console.error("Consolidated API route failed.", { route, message: error?.message });
    if (!res.headersSent) return res.status(500).json({ success: false, message: "The request could not be completed." });
  }
}

function applicationQuery(query, route) {
  const sanitized = { ...(query || {}) };
  delete sanitized.route;

  const wildcardPath = queryValue(sanitized.path);
  const routePath = route.includes("/") ? route.slice(route.indexOf("/") + 1) : route;
  if (wildcardPath === route || wildcardPath === routePath) delete sanitized.path;
  return sanitized;
}

function queryValue(value) {
  return Array.isArray(value) ? value.join("/") : value;
}
