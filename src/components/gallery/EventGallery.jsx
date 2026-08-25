import { CalendarDays, Image as ImageIcon, LockKeyhole } from "lucide-react";

export default function EventGallery({ event, onLogout, leaving }) {
  const eventDate = formatEventDate(event.eventDate);
  return (
    <main className="gallery-event-shell" aria-labelledby="gallery-event-title">
      <header className="gallery-event-header">
        <div>
          <p className="eyebrow">DFB Solutions / Private Gallery</p>
          <h1 id="gallery-event-title">{event.title}</h1>
          {eventDate && <p className="gallery-event-date"><CalendarDays aria-hidden="true" />{eventDate}</p>}
        </div>
        <button className="btn btn-secondary" type="button" onClick={onLogout} disabled={leaving}>
          <LockKeyhole aria-hidden="true" />{leaving ? "Leaving…" : "Leave Gallery"}
        </button>
      </header>
      <section className="gallery-empty-state" aria-label="Gallery delivery status">
        <span><ImageIcon aria-hidden="true" /></span>
        <p className="eyebrow">Private photo delivery</p>
        <h2>Your gallery is being prepared.</h2>
        <p>Photos for this event will appear here when they are ready for private viewing.</p>
        <small>{event.photoCount > 0 ? `${event.photoCount} photos are currently associated with this event.` : "No photos are available to view yet."}</small>
      </section>
    </main>
  );
}

function formatEventDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric", year: "numeric" }).format(date);
}
