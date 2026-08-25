export class GalleryApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "GalleryApiError";
    this.status = status;
  }
}

export async function getGallerySession() {
  const response = await request("/api/gallery/session", {}, { allowUnauthorized: true });
  return response?.event || null;
}

export function accessGallery(code) {
  return request("/api/gallery/access", { method: "POST", body: JSON.stringify({ code }) });
}

export function logoutGallery() {
  return request("/api/gallery/logout", { method: "POST" });
}

export function listAdminGalleries({ page = 1, limit = 100 } = {}) {
  return request(`/api/admin/galleries?page=${page}&limit=${limit}`);
}

export function createAdminGallery(payload) {
  return request("/api/admin/galleries", { method: "POST", body: JSON.stringify(payload) });
}

export function updateAdminGallery(id, payload) {
  return request(`/api/admin/galleries?id=${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function resetAdminGalleryCode(id, payload) {
  return request(`/api/admin/galleries?id=${encodeURIComponent(id)}&action=reset-code`, { method: "POST", body: JSON.stringify(payload) });
}

export function runAdminGalleryAction(id, action) {
  return request(`/api/admin/galleries?id=${encodeURIComponent(id)}&action=${encodeURIComponent(action)}`, { method: "POST", body: JSON.stringify({}) });
}

async function request(url, options = {}, { allowUnauthorized = false } = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: options.body ? { "Content-Type": "application/json", ...options.headers } : options.headers,
  });
  const data = await response.json().catch(() => ({}));
  if (allowUnauthorized && [401, 403].includes(response.status)) return null;
  if (!response.ok || data.success === false) {
    throw new GalleryApiError(data.error || data.message || "The request could not be completed.", response.status);
  }
  return data;
}
