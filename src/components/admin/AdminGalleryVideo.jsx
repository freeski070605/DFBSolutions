import { Check, Film, LoaderCircle, Play, RefreshCw, Trash2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  completeAdminGalleryVideo,
  deleteAdminGalleryVideo,
  getAdminGalleryVideo,
  getAdminGalleryVideoUploadUrl,
  markAdminGalleryVideoFailed,
  reserveAdminGalleryVideo,
} from "../../utils/galleryApi.js";
import { formatFileSize } from "../../utils/galleryImageProcessing.js";
import { uploadToPresignedUrl } from "../../utils/galleryUpload.js";

const MAX_VIDEO_BYTES = 5 * 1024 * 1024 * 1024;

export default function AdminGalleryVideo({ event, onEventChanged }) {
  const [active, setActive] = useState(null);
  const [pending, setPending] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [message, setMessage] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminGalleryVideo(event.id);
      setActive(data.item || null);
      setPending(data.pending || null);
    } catch (error) { setMessage(error.message); }
    finally { setLoading(false); }
  }, [event.id]);

  useEffect(() => { load(); return () => abortRef.current?.abort(); }, [load]);

  async function chooseVideo(file) {
    setMessage("");
    if (!file) return;
    if (file.type !== "video/mp4") return setMessage("Choose a web-ready H.264 MP4 file.");
    if (file.size < 1 || file.size > MAX_VIDEO_BYTES) return setMessage("Event videos must be 5 GB or smaller.");
    try {
      const metadata = await readVideoMetadata(file);
      setSelected({ file, ...metadata, videoId: null });
      setStatus("ready"); setProgress(0); setUploadedBytes(0);
    } catch { setMessage("This MP4 could not be read. Export a web-ready H.264 MP4 and try again."); }
  }

  async function uploadVideo() {
    if (!selected || ["uploading", "verifying"].includes(status)) return;
    setMessage("");
    const controller = new AbortController();
    abortRef.current = controller;
    let reservedVideoId = selected.videoId;
    try {
      let videoId = reservedVideoId;
      if (!videoId) {
        if (pending) await deleteAdminGalleryVideo(event.id, pending.id);
        const reservation = await reserveAdminGalleryVideo({
          eventId: event.id, originalFilename: selected.file.name,
          mimeType: selected.file.type, originalBytes: selected.file.size,
        });
        videoId = reservation.item.id;
        reservedVideoId = videoId;
        setSelected((current) => ({ ...current, videoId }));
        setPending(reservation.item);
      }
      const permission = await getAdminGalleryVideoUploadUrl(event.id, videoId);
      setStatus("uploading");
      await uploadToPresignedUrl(permission.upload.url, selected.file, permission.upload.contentType, (loaded, total) => {
        setUploadedBytes(loaded);
        setProgress(total ? Math.round((loaded / total) * 96) : 0);
      }, controller.signal);
      setStatus("verifying"); setProgress(98);
      await completeAdminGalleryVideo({
        eventId: event.id, videoId, durationSeconds: selected.durationSeconds,
        width: selected.width, height: selected.height,
      });
      setStatus("complete"); setProgress(100); setUploadedBytes(selected.file.size);
      setSelected(null); setPending(null);
      setMessage(active ? "Replacement video is ready and the previous file was safely retired." : "Featured event video is ready for clients.");
      await load(); await onEventChanged?.();
    } catch (error) {
      const aborted = controller.signal.aborted;
      setStatus("failed");
      setMessage(aborted ? "Upload canceled. The working featured video was not changed." : error.message || "Video upload failed. Retry when ready.");
      const videoId = reservedVideoId || pending?.id;
      if (videoId && !aborted) await markAdminGalleryVideoFailed(event.id, videoId, error.message).catch(() => {});
    } finally { abortRef.current = null; }
  }

  async function cancelUpload() {
    abortRef.current?.abort();
    const videoId = selected?.videoId || pending?.id;
    if (videoId) await deleteAdminGalleryVideo(event.id, videoId).catch((error) => setMessage(error.message));
    setSelected(null); setPending(null); setStatus("idle"); setProgress(0); setUploadedBytes(0);
  }

  async function removeActive() {
    setStatus("removing"); setMessage("");
    try {
      await deleteAdminGalleryVideo(event.id, active.id);
      setActive(null); setConfirmRemove(false); setStatus("idle");
      setMessage("Featured event video removed from the gallery and private storage.");
      await onEventChanged?.();
    } catch (error) { setStatus("idle"); setMessage(error.message); await load(); }
  }

  const busy = ["uploading", "verifying", "removing"].includes(status);
  return <section className="gallery-video-admin-panel">
    <div className="gallery-video-admin-heading">
      <div><p className="eyebrow">Featured event video</p><h2>Give clients the finished film.</h2><p>For reliable playback on phones, tablets and computers, upload an H.264 MP4.</p></div>
      {!selected && <label className="btn btn-primary gallery-video-file-button"><Upload />{active ? "Replace Video" : "Upload Event Video"}<input type="file" accept="video/mp4,.mp4" disabled={busy} onChange={(event) => { chooseVideo(event.target.files?.[0]); event.target.value = ""; }} /></label>}
    </div>
    {message && <p className={`gallery-video-message ${status === "failed" ? "is-error" : ""}`} role={status === "failed" ? "alert" : "status"}>{message}</p>}
    {loading ? <div className="gallery-video-admin-loading"><LoaderCircle />Loading event film…</div> : active && <article className="gallery-video-active">
      <div className="gallery-video-preview"><video controls playsInline preload="metadata" poster={active.posterUrl || "/dfb-film-poster.svg"} src={active.url} /></div>
      <div className="gallery-video-details"><span className="gallery-status-badge is-published"><Check />Ready</span><h3>{active.originalFilename}</h3><p>{dimensions(active)} · {formatDuration(active.durationSeconds)} · {formatFileSize(active.originalBytes)}</p><div><button className="btn btn-secondary" onClick={() => document.querySelector(".gallery-video-preview video")?.play()}><Play />Preview</button><button className="btn gallery-danger-button" onClick={() => setConfirmRemove(true)} disabled={busy}><Trash2 />Remove</button></div></div>
    </article>}
    {!loading && !active && !selected && <div className="gallery-video-empty"><Film /><strong>No featured event video</strong><span>The event can remain photo-only, or add one finished MP4 above.</span></div>}
    {selected && <article className="gallery-video-upload-card">
      <div><strong>{selected.file.name}</strong><span>{dimensions(selected)} · {formatDuration(selected.durationSeconds)} · {formatFileSize(selected.file.size)}</span></div>
      <progress value={progress} max="100">{progress}%</progress>
      <p>{status === "uploading" ? `Uploading Event Film — ${progress}% · ${formatFileSize(uploadedBytes)} of ${formatFileSize(selected.file.size)}` : status === "verifying" ? "Verifying the private R2 object…" : status === "failed" ? "Upload failed. The current featured video is still safe." : active ? "The current featured video will remain live until this replacement is verified." : "Ready for direct upload to private storage."}</p>
      <div><button className="btn btn-primary" onClick={uploadVideo} disabled={busy}>{status === "failed" ? <><RefreshCw />Retry</> : <><Upload />Start Upload</>}</button><button className="btn btn-secondary" onClick={cancelUpload} disabled={status === "verifying"}><X />{status === "uploading" ? "Cancel Upload" : "Cancel"}</button></div>
    </article>}
    {pending && !selected && <div className="gallery-video-orphan"><span>{pending.removalPending ? "A hidden private video still requires storage cleanup:" : "An unfinished upload is reserved for"} <strong>{pending.originalFilename}</strong>.</span><button onClick={cancelUpload}><Trash2 />{pending.removalPending ? "Retry Cleanup" : "Remove Reservation"}</button></div>}
    {confirmRemove && <div className="gallery-video-confirm" role="dialog" aria-modal="true" aria-label="Remove featured event video"><p>Remove <strong>{active.originalFilename}</strong> from this private event gallery?</p><div><button className="btn btn-secondary" onClick={() => setConfirmRemove(false)} disabled={status === "removing"}>Keep Video</button><button className="btn gallery-danger-button" onClick={removeActive} disabled={status === "removing"}>{status === "removing" ? "Removing…" : "Remove Video"}</button></div></div>}
  </section>;
}

function readVideoMetadata(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => { const result = { durationSeconds: video.duration, width: video.videoWidth, height: video.videoHeight }; URL.revokeObjectURL(url); result.durationSeconds > 0 && result.width > 0 && result.height > 0 ? resolve(result) : reject(new Error("Invalid video metadata.")); };
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Video metadata could not be read.")); };
    video.src = url;
  });
}
function dimensions(video) { return video.width && video.height ? `${video.width} × ${video.height}` : "MP4 video"; }
function formatDuration(value) { const seconds = Math.max(0, Math.round(Number(value) || 0)); return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
