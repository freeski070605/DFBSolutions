import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import EventGallery from "../components/gallery/EventGallery.jsx";
import Seo from "../components/Seo.jsx";
import { accessGallery, GalleryApiError, getGallerySession, logoutGallery } from "../utils/galleryApi.js";

export default function GalleryPage() {
  const [checking, setChecking] = useState(true);
  const [event, setEvent] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let active = true;
    getGallerySession()
      .then((currentEvent) => { if (active) setEvent(currentEvent); })
      .catch(() => { if (active) setError("Private gallery access is temporarily unavailable. Please try again."); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  async function submit(eventSubmit) {
    eventSubmit.preventDefault();
    if (!code.trim() || submitting) return;
    const submittedCode = code;
    setCode("");
    setError("");
    setSubmitting(true);
    try {
      const data = await accessGallery(submittedCode);
      setEvent(data.event);
    } catch (requestError) {
      setError(requestError instanceof GalleryApiError && requestError.status === 429
        ? "Too many attempts. Please wait a few minutes before trying again."
        : "That event code is invalid or unavailable. Please check your code and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function leaveGallery() {
    if (leaving) return;
    setLeaving(true);
    setError("");
    try {
      await logoutGallery();
      setEvent(null);
      setCode("");
    } catch {
      setError("The gallery could not be closed. Please try again.");
    } finally {
      setLeaving(false);
    }
  }

  return (
    <div className="gallery-portal">
      <Seo title="Client Gallery" description="Private event gallery access for DFB Solutions photography clients." noindex />
      {checking ? (
        <main className="gallery-checking" aria-live="polite"><span className="gallery-loading-mark" aria-hidden="true" />Checking private gallery access…</main>
      ) : event ? (
        <EventGallery event={event} onLogout={leaveGallery} leaving={leaving} onAccessLost={() => setEvent(null)} />
      ) : (
        <main className="gallery-entry-shell">
          <section className="gallery-entry-intro">
            <div className="gallery-private-mark" aria-hidden="true"><ShieldCheck /></div>
            <p className="eyebrow">DFB Client Gallery</p>
            <h1>Private<br /><em>Event Access.</em></h1>
            <p>Photography delivered with care, available only to invited event clients.</p>
          </section>
          <section className="gallery-code-panel" aria-labelledby="gallery-code-title">
            <p className="gallery-panel-index">Private access / 01</p>
            <KeyRound aria-hidden="true" />
            <h2 id="gallery-code-title">Enter Your Event Code</h2>
            <p>Enter the private code provided by DFB Solutions to access your event gallery.</p>
            <form onSubmit={submit}>
              <label htmlFor="gallery-event-code">Event code</label>
              <div className="gallery-code-control">
                <input
                  id="gallery-event-code"
                  name="eventCode"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck="false"
                  placeholder="EX: ANDREA80"
                  value={code}
                  onChange={(inputEvent) => setCode(inputEvent.target.value.toUpperCase())}
                  disabled={submitting}
                />
                <button type="submit" aria-label="Open private event gallery" disabled={submitting || !code.trim()}>
                  {submitting ? <span className="gallery-button-loading">Opening…</span> : <><span>Open Gallery</span><ArrowRight aria-hidden="true" /></>}
                </button>
              </div>
              <p className="gallery-code-error" role="alert" aria-live="polite">{error}</p>
            </form>
            <small>Your code is checked securely and never added to the page address.</small>
          </section>
        </main>
      )}
      {event && error && <p className="gallery-floating-error" role="alert" aria-live="polite">{error}</p>}
    </div>
  );
}
