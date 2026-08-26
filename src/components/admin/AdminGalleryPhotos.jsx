import {
  ArrowDown, ArrowLeft, ArrowUp, Check, CloudUpload, Crown, Image as ImageIcon,
  LoaderCircle, RefreshCw, RotateCcw, Trash2, Upload, X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  completeAdminGalleryUpload,
  deleteAdminGalleryPhoto,
  getAdminGalleryUploadUrls,
  listAdminGalleryPhotos,
  markAdminGalleryUploadFailed,
  reorderAdminGalleryPhotos,
  reserveAdminGalleryPhotos,
  setAdminGalleryCover,
} from "../../utils/galleryApi.js";
import {
  formatFileSize,
  processGalleryImage,
  runWithConcurrency,
  validateSelectedGalleryFiles,
} from "../../utils/galleryImageProcessing.js";
import { uploadToPresignedUrl } from "../../utils/galleryUpload.js";

const RESERVATION_SIZE = 50;
const URL_BATCH_SIZE = 6;

export default function AdminGalleryPhotos({ event, onBack, onEventChanged }) {
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [queue, setQueue] = useState([]);
  const [selectionErrors, setSelectionErrors] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const progressPatches = useRef(new Map());
  const progressFrame = useRef(null);

  const load = useCallback(async ({ append = false, targetPage = 1 } = {}) => {
    append ? setLoadingMore(true) : setLoading(true);
    setError("");
    try {
      const data = await listAdminGalleryPhotos(event.id, { page: targetPage, limit: 60 });
      setPhotos((current) => append ? [...current, ...(data.items || [])] : data.items || []);
      setPage(data.page || targetPage);
      setPages(data.pages || 1);
      setOrderDirty(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [event.id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => () => {
    if (progressFrame.current) cancelAnimationFrame(progressFrame.current);
  }, []);

  const patchQueue = useCallback((localId, patch) => {
    progressPatches.current.set(localId, { ...progressPatches.current.get(localId), ...patch });
    if (progressFrame.current) return;
    progressFrame.current = requestAnimationFrame(() => {
      const pending = progressPatches.current;
      progressPatches.current = new Map();
      progressFrame.current = null;
      setQueue((current) => current.map((item) => pending.has(item.localId) ? { ...item, ...pending.get(item.localId) } : item));
    });
  }, []);

  const readyPhotos = useMemo(() => photos.filter((photo) => photo.status === "ready"), [photos]);
  const incompletePhotos = useMemo(() => photos.filter((photo) => photo.status !== "ready"), [photos]);
  const queueTotalBytes = useMemo(() => queue.reduce((total, item) => total + item.file.size, 0), [queue]);
  const completeCount = queue.filter((item) => item.status === "complete").length;
  const overallProgress = queue.length ? Math.round(queue.reduce((sum, item) => sum + (item.progress || 0), 0) / queue.length) : 0;
  const actionableQueue = queue.filter((item) => ["queued", "failed"].includes(item.status));

  function addFiles(fileList) {
    if (uploading) return;
    const { accepted, errors } = validateSelectedGalleryFiles(fileList);
    const known = new Set(queue.map((item) => `${item.file.name}:${item.file.size}:${item.file.lastModified}`));
    const additions = accepted.filter((file) => !known.has(`${file.name}:${file.size}:${file.lastModified}`)).map((file) => ({
      localId: createLocalId(), file, status: "queued", label: "Queued", progress: 0, error: "", photoId: null,
    }));
    setQueue((current) => [...current, ...additions]);
    setSelectionErrors(errors);
    setNotice(additions.length ? `${additions.length} ${additions.length === 1 ? "photo" : "photos"} added to the upload queue.` : "");
  }

  async function startUploads(targetIds = null) {
    if (uploading) return;
    const targets = queue.filter((item) => ["queued", "failed"].includes(item.status) && (!targetIds || targetIds.includes(item.localId)));
    if (!targets.length) return;
    setUploading(true);
    setError("");
    setNotice("");
    try {
      const unreserved = targets.filter((item) => !item.photoId);
      for (const batch of chunk(unreserved, RESERVATION_SIZE)) {
        const data = await reserveAdminGalleryPhotos(event.id, batch.map((item) => ({
          clientId: item.localId,
          originalFilename: item.file.name,
          mimeType: item.file.type,
          originalBytes: item.file.size,
        })));
        data.items.forEach((reservation, index) => {
          batch[index].photoId = reservation.id;
          patchQueue(batch[index].localId, { photoId: reservation.id, status: "queued", label: "Reserved" });
        });
      }
      for (const batch of chunk(targets.filter((item) => item.photoId), URL_BATCH_SIZE)) {
        const permissions = await getAdminGalleryUploadUrls(event.id, batch.map((item) => item.photoId));
        const byPhotoId = new Map(permissions.uploads.map((upload) => [upload.photoId, upload]));
        await runWithConcurrency(batch, async (item) => uploadOne(item, byPhotoId.get(item.photoId), event.id, patchQueue));
        await load();
        await onEventChanged?.();
      }
      setNotice("Upload queue finished. Review any failed photos and retry when ready.");
    } catch (requestError) {
      setError(requestError.message || "The upload queue could not continue.");
    } finally {
      setUploading(false);
    }
  }

  function removeQueued(localId) {
    if (uploading) return;
    setQueue((current) => current.filter((item) => item.localId !== localId));
  }

  function movePhoto(photoId, direction) {
    const ready = photos.filter((photo) => photo.status === "ready");
    const index = ready.findIndex((photo) => photo.id === photoId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= ready.length) return;
    [ready[index], ready[target]] = [ready[target], ready[index]];
    let readyIndex = 0;
    setPhotos((current) => current.map((photo) => photo.status === "ready" ? ready[readyIndex++] : photo));
    setOrderDirty(true);
  }

  async function saveOrder() {
    setSavingOrder(true); setError("");
    try {
      await reorderAdminGalleryPhotos(event.id, readyPhotos.map((photo, index) => ({ photoId: photo.id, sortOrder: index })));
      setNotice("Photo order saved."); setOrderDirty(false); await load();
    } catch (requestError) { setError(requestError.message); }
    finally { setSavingOrder(false); }
  }

  async function setCover(photo) {
    setError("");
    try {
      await setAdminGalleryCover(event.id, photo.id);
      setPhotos((current) => current.map((item) => ({ ...item, isCover: item.id === photo.id })));
      setNotice(`${photo.originalFilename} is now the event cover.`);
      await onEventChanged?.();
    } catch (requestError) { setError(requestError.message); }
  }

  async function removePhoto() {
    const photo = confirmDelete;
    if (!photo) return;
    setConfirmDelete({ ...photo, deleting: true }); setError("");
    try {
      await deleteAdminGalleryPhoto(event.id, photo.id);
      setConfirmDelete(null);
      setNotice("Photo removed from the gallery and private storage.");
      await load();
      await onEventChanged?.();
    } catch (requestError) {
      setConfirmDelete(null); setError(requestError.message);
      await load();
    }
  }

  return <div className="admin-gallery-photos">
    <header className="admin-page-header gallery-photo-heading">
      <button className="gallery-back-button" onClick={onBack} disabled={uploading}><ArrowLeft />Event Galleries</button>
      <div><p className="eyebrow">Photo management</p><h1>{event.title}</h1><p>{event.photoCount} ready {event.photoCount === 1 ? "photo" : "photos"} available to clients.</p></div>
    </header>
    {(error || notice) && <p className={`admin-message ${error ? "is-error" : ""}`} role={error ? "alert" : "status"}>{error || notice}</p>}

    <section className="gallery-upload-panel">
      <div className="gallery-photo-section-title"><div><p className="eyebrow">Direct to private storage</p><h2>Upload Photos</h2></div><span>JPEG / PNG / WebP · 100 MB max each</span></div>
      <label
        className={`gallery-drop-zone ${dragging ? "is-dragging" : ""}`}
        onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
      >
        <input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
        <CloudUpload aria-hidden="true" />
        <strong>Drop photographs here</strong>
        <span>or choose photos from this device</span>
        <i>Choose Photos</i>
      </label>
      {selectionErrors.length > 0 && <div className="gallery-file-errors" role="alert"><strong>{selectionErrors.length} files were not added.</strong>{selectionErrors.slice(0, 8).map((message) => <span key={message}>{message}</span>)}{selectionErrors.length > 8 && <span>And {selectionErrors.length - 8} more unsupported files.</span>}</div>}
      {queue.length > 0 && <div className="gallery-upload-queue">
        <header><div><strong>{queue.length} photos · {formatFileSize(queueTotalBytes)} originals</strong><span>{completeCount} / {queue.length} complete</span></div><progress value={overallProgress} max="100">{overallProgress}%</progress></header>
        <div className="gallery-upload-items">{queue.map((item) => <article key={item.localId} className={`is-${item.status}`}>
          <span className="gallery-queue-state">{item.status === "complete" ? <Check /> : item.status === "failed" ? <X /> : item.status === "queued" ? <Upload /> : <LoaderCircle />}</span>
          <div><strong>{item.file.name}</strong><small>{item.error || item.label} · {formatFileSize(item.file.size)}</small><progress value={item.progress} max="100">{item.progress}%</progress></div>
          {item.status === "failed" ? <button onClick={() => startUploads([item.localId])} disabled={uploading}><RotateCcw />Retry</button> : ["queued", "complete"].includes(item.status) ? <button aria-label={`Remove ${item.file.name} from queue`} onClick={() => removeQueued(item.localId)} disabled={uploading}><X /></button> : null}
        </article>)}</div>
        <footer><button className="btn btn-secondary" onClick={() => setQueue((current) => current.filter((item) => item.status !== "complete"))} disabled={uploading || !completeCount}>Clear Completed</button><button className="btn btn-primary" onClick={() => startUploads()} disabled={uploading || !actionableQueue.length}>{uploading ? <><LoaderCircle />Uploading…</> : <><Upload />Start Upload</>}</button></footer>
      </div>}
    </section>

    <section className="gallery-photo-library">
      <div className="gallery-photo-section-title"><div><p className="eyebrow">Private event library</p><h2>Gallery Photos</h2></div><div>{orderDirty && <button className="btn btn-primary" onClick={saveOrder} disabled={savingOrder}>{savingOrder ? "Saving…" : "Save Order"}</button>}<button className="gallery-icon-button" aria-label="Refresh photo list" onClick={() => load()} disabled={loading}><RefreshCw /></button></div></div>
      {loading ? <div className="gallery-admin-loading"><RefreshCw />Loading photos…</div> : photos.length === 0 ? <div className="admin-empty gallery-photo-empty"><ImageIcon /><h3>No uploaded photos yet.</h3><p>Choose photographs above to begin this private event gallery.</p></div> : <>
        {incompletePhotos.length > 0 && <div className="gallery-incomplete-list"><h3>Incomplete uploads</h3>{incompletePhotos.map((photo) => <article key={photo.id}><span className={`gallery-status-badge is-${photo.status}`}>{photo.status}</span><strong>{photo.originalFilename}</strong><small>Upload again from the active queue, or remove this abandoned reservation.</small><button onClick={() => setConfirmDelete(photo)}><Trash2 />Remove</button></article>)}</div>}
        {readyPhotos.length > 0 && <div className="gallery-admin-photo-grid">{readyPhotos.map((photo, index) => <article key={photo.id} className={photo.isCover ? "is-cover" : ""}>
          <div className="gallery-admin-photo-image"><img src={photo.thumbUrl} alt="" loading="lazy" />{photo.isCover && <span><Crown />Cover</span>}</div>
          <div className="gallery-admin-photo-meta"><strong>{photo.originalFilename}</strong><small>{photo.width} × {photo.height} · {formatFileSize(photo.originalBytes)}</small></div>
          <div className="gallery-admin-photo-actions"><button aria-label={`Move ${photo.originalFilename} earlier`} onClick={() => movePhoto(photo.id, -1)} disabled={index === 0}><ArrowUp /></button><button aria-label={`Move ${photo.originalFilename} later`} onClick={() => movePhoto(photo.id, 1)} disabled={index === readyPhotos.length - 1}><ArrowDown /></button><button onClick={() => setCover(photo)} disabled={photo.isCover}><Crown />{photo.isCover ? "Cover" : "Set Cover"}</button><button className="danger" onClick={() => setConfirmDelete(photo)}><Trash2 />Delete</button></div>
        </article>)}</div>}
        {page < pages && <button className="btn btn-secondary gallery-load-more" onClick={() => load({ append: true, targetPage: page + 1 })} disabled={loadingMore}>{loadingMore ? "Loading…" : "Load More Photos"}</button>}
      </>}
    </section>
    {confirmDelete && <PhotoDeleteDialog photo={confirmDelete} onClose={() => !confirmDelete.deleting && setConfirmDelete(null)} onConfirm={removePhoto} />}
  </div>;
}

async function uploadOne(item, permission, eventId, patchQueue) {
  if (!permission) throw new Error("Upload permission was not returned for a reserved photo.");
  try {
    patchQueue(item.localId, { status: "preparing", label: "Preparing web and thumbnail copies…", error: "", progress: 2 });
    const processed = await processGalleryImage(item.file);
    const totalBytes = item.file.size + processed.web.size + processed.thumb.size;
    let completedBytes = 0;
    const uploadVariant = async (key, blob, label, baseProgress) => {
      patchQueue(item.localId, { status: "uploading", label, progress: baseProgress });
      await uploadToPresignedUrl(permission.urls[key], blob, permission.contentTypes[key], (loaded) => {
        patchQueue(item.localId, { progress: Math.min(94, Math.round(((completedBytes + loaded) / totalBytes) * 94)), label });
      });
      completedBytes += blob.size;
    };
    await uploadVariant("web", processed.web, "Uploading web copy…", 5);
    processed.web = null;
    await uploadVariant("thumb", processed.thumb, "Uploading thumbnail…", Math.round((completedBytes / totalBytes) * 94));
    processed.thumb = null;
    await uploadVariant("original", processed.original, "Uploading original…", Math.round((completedBytes / totalBytes) * 94));
    patchQueue(item.localId, { status: "verifying", label: "Verifying private storage…", progress: 96 });
    await completeAdminGalleryUpload({ eventId, photoId: item.photoId, width: processed.width, height: processed.height });
    patchQueue(item.localId, { status: "complete", label: "Complete", progress: 100, error: "" });
  } catch (error) {
    const message = safeUploadMessage(error);
    patchQueue(item.localId, { status: "failed", label: "Failed", error: message });
    if (item.photoId) await markAdminGalleryUploadFailed(eventId, item.photoId, message).catch(() => {});
  }
}

function PhotoDeleteDialog({ photo, onClose, onConfirm }) {
  return <div className="editor-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="record-editor gallery-admin-modal is-compact" role="dialog" aria-modal="true" aria-labelledby="delete-photo-title"><header><div><p className="eyebrow">Private storage removal</p><h2 id="delete-photo-title">Delete Photo?</h2></div><button aria-label="Close dialog" onClick={onClose} disabled={photo.deleting}><X /></button></header><div className="gallery-confirmation"><p><strong>{photo.originalFilename}</strong> will be removed from the event and all three private R2 versions will be deleted. This cannot be undone.</p><footer><button className="btn btn-secondary" onClick={onClose} disabled={photo.deleting}>Cancel</button><button className="btn gallery-danger-button" onClick={onConfirm} disabled={photo.deleting}>{photo.deleting ? "Deleting…" : "Delete Photo"}</button></footer></div></section></div>;
}

function safeUploadMessage(error) {
  const message = typeof error?.message === "string" ? error.message : "Upload failed. Try this photo again.";
  return message.length > 220 ? "Upload failed. Try this photo again." : message;
}

function createLocalId() {
  return typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `photo_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function chunk(items, size) {
  const output = [];
  for (let index = 0; index < items.length; index += size) output.push(items.slice(index, index + size));
  return output;
}
