import {
  ArrowLeft, ArrowRight, CalendarDays, Download, Image as ImageIcon, LockKeyhole,
  Maximize2, RefreshCw, X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GalleryApiError, listGalleryPhotos, requestGalleryPhotoDownload } from "../../utils/galleryApi.js";

export default function EventGallery({ event, onLogout, leaving, onAccessLost }) {
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(Number(event.photoCount) || 0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [staleUrls, setStaleUrls] = useState(false);
  const [coverUrl, setCoverUrl] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const eventDate = formatEventDate(event.eventDate);

  const loadPage = useCallback(async (targetPage, { append = false } = {}) => {
    append ? setLoadingMore(true) : setLoading(true);
    setError("");
    try {
      const data = await listGalleryPhotos({ page: targetPage, limit: 40 });
      setPhotos((current) => append ? [...current, ...(data.items || [])] : data.items || []);
      setPage(data.page || targetPage);
      setPages(data.pages || 1);
      setTotal(Number(data.total) || 0);
      setCoverUrl(data.coverUrl || null);
      setStaleUrls(false);
    } catch (requestError) {
      if (requestError instanceof GalleryApiError && [401, 403].includes(requestError.status)) onAccessLost?.();
      else setError("This gallery could not be loaded. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [onAccessLost]);

  useEffect(() => { loadPage(1); }, [loadPage]);

  async function refreshLoadedUrls() {
    setLoading(true); setError("");
    try {
      const refreshed = [];
      let nextCover = null;
      for (let target = 1; target <= Math.max(1, page); target += 1) {
        const data = await listGalleryPhotos({ page: target, limit: 40 });
        refreshed.push(...(data.items || []));
        nextCover ||= data.coverUrl || null;
        setPages(data.pages || 1);
        setTotal(Number(data.total) || 0);
      }
      setPhotos(refreshed); setCoverUrl(nextCover); setStaleUrls(false);
    } catch (requestError) {
      if (requestError instanceof GalleryApiError && [401, 403].includes(requestError.status)) onAccessLost?.();
      else setError("Fresh image links could not be loaded. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <main className={`gallery-event-shell ${coverUrl ? "has-cover" : ""}`} aria-labelledby="gallery-event-title">
      <header className="gallery-event-header">
        {coverUrl && <img className="gallery-event-cover" src={coverUrl} alt="" onError={() => setStaleUrls(true)} />}
        <div className="gallery-event-heading-copy">
          <p className="eyebrow">DFB Solutions / Private Gallery</p>
          <h1 id="gallery-event-title">{event.title}</h1>
          {eventDate && <p className="gallery-event-date"><CalendarDays aria-hidden="true" />{eventDate}</p>}
        </div>
        <button className="btn btn-secondary" type="button" onClick={onLogout} disabled={leaving}>
          <LockKeyhole aria-hidden="true" />{leaving ? "Leaving…" : "Leave Gallery"}
        </button>
      </header>

      {error && <div className="gallery-public-message is-error" role="alert"><p>{error}</p><button onClick={() => loadPage(Math.max(1, page))}><RefreshCw />Try Again</button></div>}
      {staleUrls && <div className="gallery-public-message"><p>Some private image links need to be refreshed.</p><button onClick={refreshLoadedUrls}><RefreshCw />Refresh Images</button></div>}

      {loading && !photos.length ? <section className="gallery-photo-loading" aria-live="polite"><span className="gallery-loading-mark" />Preparing your photographs…</section> : photos.length ? <section className="gallery-client-library" aria-label={`${event.title} photographs`}>
        <div className="gallery-client-intro"><p className="eyebrow">Event photographs</p><span>{photos.length} of {total || photos.length} loaded</span></div>
        <div className="gallery-photo-columns">{photos.map((photo, index) => <button key={photo.id} className="gallery-photo-tile" onClick={() => setActiveIndex(index)} aria-label={`Open photograph ${index + 1} of ${total || photos.length}`}>
          <img src={photo.thumbUrl} alt="" width={photo.width || undefined} height={photo.height || undefined} loading="lazy" decoding="async" onError={() => setStaleUrls(true)} />
          <span><Maximize2 aria-hidden="true" />View</span>
        </button>)}</div>
        {page < pages && <button className="btn btn-secondary gallery-public-load-more" onClick={() => loadPage(page + 1, { append: true })} disabled={loadingMore}>{loadingMore ? "Loading…" : "Load More Photographs"}</button>}
      </section> : !loading && !error ? <section className="gallery-empty-state" aria-label="Gallery delivery status">
        <span><ImageIcon aria-hidden="true" /></span>
        <p className="eyebrow">Private photo delivery</p>
        <h2>Your gallery is being prepared.</h2>
        <p>Photos for this event will appear here when they are ready for private viewing.</p>
        <small>No photos are available to view yet.</small>
      </section> : null}

      {activeIndex != null && photos[activeIndex] && <GalleryLightbox
        photos={photos}
        index={activeIndex}
        downloadsEnabled={event.downloadsEnabled}
        onChange={setActiveIndex}
        onClose={() => setActiveIndex(null)}
        onStale={() => setStaleUrls(true)}
      />}
    </main>
  );
}

function GalleryLightbox({ photos, index, downloadsEnabled, onChange, onClose, onStale }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const pointerStart = useRef(null);
  const closeButton = useRef(null);
  const photo = photos[index];
  const previous = useCallback(() => onChange(index > 0 ? index - 1 : photos.length - 1), [index, onChange, photos.length]);
  const next = useCallback(() => onChange(index < photos.length - 1 ? index + 1 : 0), [index, onChange, photos.length]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft") previous();
      else if (event.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKeyDown);
    closeButton.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); };
  }, [next, onClose, previous]);

  useEffect(() => {
    setError("");
    for (const adjacent of [photos[(index - 1 + photos.length) % photos.length], photos[(index + 1) % photos.length]]) {
      if (adjacent?.webUrl) { const image = new Image(); image.src = adjacent.webUrl; }
    }
  }, [index, photos]);

  async function downloadOriginal() {
    if (downloading) return;
    setDownloading(true); setError("");
    try {
      const data = await requestGalleryPhotoDownload(photo.id);
      const link = document.createElement("a");
      link.href = data.url;
      link.rel = "noopener";
      link.click();
    } catch { setError("The original could not be downloaded. Please try again."); }
    finally { setDownloading(false); }
  }

  function finishSwipe(event) {
    if (pointerStart.current == null) return;
    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(distance) > 55) distance > 0 ? previous() : next();
  }

  return <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={`Photograph ${index + 1} of ${photos.length}`} onPointerDown={(event) => { pointerStart.current = event.clientX; }} onPointerUp={finishSwipe}>
    <div className="gallery-lightbox-bar"><span>{String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</span><div>{downloadsEnabled && <button onClick={downloadOriginal} disabled={downloading}><Download />{downloading ? "Preparing…" : "Download Original"}</button>}<button ref={closeButton} aria-label="Close lightbox" onClick={onClose}><X /></button></div></div>
    <button className="gallery-lightbox-arrow is-previous" aria-label="Previous photograph" onClick={previous}><ArrowLeft /></button>
    <figure><img src={photo.webUrl} alt="" width={photo.width || undefined} height={photo.height || undefined} onError={() => { onStale(); setError("This private image link needs to be refreshed."); }} />{error && <figcaption role="alert">{error}</figcaption>}</figure>
    <button className="gallery-lightbox-arrow is-next" aria-label="Next photograph" onClick={next}><ArrowRight /></button>
  </div>;
}

function formatEventDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric", year: "numeric" }).format(date);
}
