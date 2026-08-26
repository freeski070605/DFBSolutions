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

export function listAdminGalleryPhotos(eventId, { page = 1, limit = 40, status = "" } = {}) {
  const params = new URLSearchParams({ eventId, page: String(page), limit: String(limit) });
  if (status) params.set("status", status);
  return request(`/api/admin/gallery-photos?${params}`);
}

export function reserveAdminGalleryPhotos(eventId, files) {
  return request("/api/admin/gallery-photos", { method: "POST", body: JSON.stringify({ eventId, files }) });
}

export function getAdminGalleryUploadUrls(eventId, photoIds) {
  return request("/api/admin/gallery-upload-urls", { method: "POST", body: JSON.stringify({ eventId, photoIds }) });
}

export function completeAdminGalleryUpload(payload) {
  return request("/api/admin/gallery-upload-complete", { method: "POST", body: JSON.stringify(payload) });
}

export function markAdminGalleryUploadFailed(eventId, photoId, message) {
  return request("/api/admin/gallery-photos?action=mark-failed", { method: "POST", body: JSON.stringify({ eventId, photoId, message }) });
}

export function setAdminGalleryCover(eventId, photoId) {
  return request("/api/admin/gallery-photos?action=set-cover", { method: "POST", body: JSON.stringify({ eventId, photoId }) });
}

export function reorderAdminGalleryPhotos(eventId, photos) {
  return request("/api/admin/gallery-photos", { method: "PUT", body: JSON.stringify({ eventId, photos }) });
}

export function deleteAdminGalleryPhoto(eventId, photoId) {
  const params = new URLSearchParams({ eventId, photoId });
  return request(`/api/admin/gallery-photos?${params}`, { method: "DELETE" });
}

export function getAdminGalleryVideo(eventId) {
  return request(`/api/admin/gallery-video?eventId=${encodeURIComponent(eventId)}`);
}

export function reserveAdminGalleryVideo(payload) {
  return request("/api/admin/gallery-video?action=reserve", { method: "POST", body: JSON.stringify(payload) });
}

export function getAdminGalleryVideoUploadUrl(eventId, videoId) {
  return request("/api/admin/gallery-video?action=upload-url", { method: "POST", body: JSON.stringify({ eventId, videoId }) });
}

export function completeAdminGalleryVideo(payload) {
  return request("/api/admin/gallery-video?action=complete", { method: "POST", body: JSON.stringify(payload) });
}

export function markAdminGalleryVideoFailed(eventId, videoId, message) {
  return request("/api/admin/gallery-video?action=mark-failed", { method: "POST", body: JSON.stringify({ eventId, videoId, message }) });
}

export function deleteAdminGalleryVideo(eventId, videoId) {
  const params = new URLSearchParams({ eventId, videoId });
  return request(`/api/admin/gallery-video?${params}`, { method: "DELETE" });
}

export function listGalleryPhotos({ page = 1, limit = 40 } = {}) {
  return request(`/api/gallery/photos?page=${page}&limit=${limit}`);
}

export function requestGalleryPhotoDownload(photoId) {
  return request("/api/gallery/download", { method: "POST", body: JSON.stringify({ photoId }) });
}

export function getGalleryVideo() {
  return request("/api/gallery/video");
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
