import { ArrowLeft, ArrowRight, Image as ImageIcon, Maximize2, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import EventFilm from "./EventFilm.jsx";

export default function EventMedia({ event, video, videoLoading, photos, photosLoading, lightboxOpen, onRefreshVideo, onOpen, onImageError }) {
  if (video) return <EventFilm video={video} onRefresh={onRefreshVideo} />;
  if (videoLoading || photosLoading) return <section className="gallery-photo-loading" aria-live="polite"><span className="gallery-loading-mark" />Preparing event media…</section>;
  if (photos.length) return <EventSlideshow event={event} photos={photos} lightboxOpen={lightboxOpen} onOpen={onOpen} onImageError={onImageError} />;
  return <section className="gallery-media-empty" aria-label="Event media status"><ImageIcon aria-hidden="true" /><h2>Your event media is being prepared.</h2><p>Photos or a film will appear here when they are ready for private viewing.</p></section>;
}

function EventSlideshow({ event, photos, lightboxOpen, onOpen, onImageError }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const pointerStart = useRef(null);
  const swiped = useRef(false);
  const resumeTimer = useRef(null);
  const visibleIndex = Math.min(index, photos.length - 1);
  const current = photos[visibleIndex];

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => () => clearTimeout(resumeTimer.current), []);
  useEffect(() => { if (index >= photos.length) setIndex(Math.max(0, photos.length - 1)); }, [index, photos.length]);
  useEffect(() => {
    if (paused || interacting || lightboxOpen || reducedMotion || photos.length < 2) return undefined;
    const timer = setInterval(() => setIndex((value) => (value + 1) % photos.length), 4500);
    return () => clearInterval(timer);
  }, [paused, interacting, lightboxOpen, reducedMotion, photos.length]);
  useEffect(() => {
    for (const photo of [photos[(visibleIndex + 1) % photos.length], photos[(visibleIndex + 2) % photos.length]]) {
      if (photo?.webUrl) { const image = new Image(); image.src = photo.webUrl; }
    }
  }, [visibleIndex, photos]);

  function interact(nextIndex) {
    setIndex((nextIndex + photos.length) % photos.length);
    setInteracting(true);
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setInteracting(false), 8000);
  }

  if (!current) return null;
  return <section className="gallery-event-slideshow" aria-label={`${event.title} slideshow`} onKeyDown={(keyEvent) => {
    if (keyEvent.target instanceof HTMLButtonElement && keyEvent.target.classList.contains("gallery-slide-image")) {
      if (keyEvent.key === "ArrowLeft") { keyEvent.preventDefault(); interact(visibleIndex - 1); }
      if (keyEvent.key === "ArrowRight") { keyEvent.preventDefault(); interact(visibleIndex + 1); }
    }
  }}>
    <div className="gallery-slide-frame" onPointerDown={(pointerEvent) => { pointerStart.current = pointerEvent.clientX; }} onPointerUp={(pointerEvent) => {
      if (pointerStart.current == null) return;
      const distance = pointerEvent.clientX - pointerStart.current;
      pointerStart.current = null;
      if (Math.abs(distance) > 55) { swiped.current = true; setTimeout(() => { swiped.current = false; }, 100); interact(visibleIndex + (distance < 0 ? 1 : -1)); }
    }}>
      <button className="gallery-slide-image" onClick={() => { if (swiped.current) { swiped.current = false; return; } onOpen(visibleIndex); }} aria-label={`Open photograph ${visibleIndex + 1} fullscreen`}>
        <img key={current.id} src={current.webUrl} alt={current.altText || `${event.title} photograph ${visibleIndex + 1}`} loading={visibleIndex === 0 ? "eager" : "lazy"} decoding="async" onError={() => onImageError(current.id)} />
        <span><Maximize2 aria-hidden="true" />View fullscreen</span>
      </button>
    </div>
    <div className="gallery-slide-controls"><div><button aria-label="Previous photograph" onClick={() => interact(visibleIndex - 1)} disabled={photos.length < 2}><ArrowLeft /></button><button aria-label="Next photograph" onClick={() => interact(visibleIndex + 1)} disabled={photos.length < 2}><ArrowRight /></button><button aria-label={paused ? "Play slideshow" : "Pause slideshow"} aria-pressed={paused} onClick={() => setPaused((value) => !value)}>{paused ? <Play /> : <Pause />}</button></div><span aria-live="polite">{visibleIndex + 1} / {photos.length}</span></div>
  </section>;
}
