import {
  Archive, Check, Clipboard, Edit3, Eye, EyeOff, GalleryVerticalEnd,
  KeyRound, Plus, RefreshCw, RotateCcw, X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  createAdminGallery,
  listAdminGalleries,
  resetAdminGalleryCode,
  runAdminGalleryAction,
  updateAdminGallery,
} from "../../utils/galleryApi.js";

export default function AdminGalleriesPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editor, setEditor] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [codeReveal, setCodeReveal] = useState(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listAdminGalleries();
      setEvents(data.items || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveEvent(payload, currentEvent) {
    const data = currentEvent
      ? await updateAdminGallery(currentEvent.id, payload)
      : await createAdminGallery(payload);
    setEditor(null);
    setNotice(currentEvent ? "Event gallery updated." : "Event gallery created.");
    if (data.eventCode) setCodeReveal({ title: "Event Created", code: data.eventCode });
    await load();
  }

  async function resetCode(payload) {
    const data = await resetAdminGalleryCode(resetting.id, payload);
    setResetting(null);
    setNotice("Event code reset. Existing client sessions were invalidated.");
    setCodeReveal({ title: "New Event Code", code: data.eventCode });
    await load();
  }

  async function performConfirmedAction() {
    if (!confirming || acting) return;
    setActing(true);
    setError("");
    try {
      await runAdminGalleryAction(confirming.event.id, confirming.action);
      setNotice(confirming.success);
      setConfirming(null);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="admin-galleries">
      <header className="admin-page-header gallery-admin-heading">
        <div><p className="eyebrow">Private photography delivery</p><h1>Event Galleries</h1><p>Create secure client events, control access, and manage delivery settings.</p></div>
        <button className="btn btn-primary" onClick={() => setEditor({ event: null })}><Plus />Create Event</button>
      </header>

      {(error || notice) && <p className={`admin-message ${error ? "is-error" : ""}`} role={error ? "alert" : "status"}>{error || notice}</p>}

      {loading ? (
        <div className="gallery-admin-loading"><RefreshCw aria-hidden="true" />Loading event galleries…</div>
      ) : events.length === 0 ? (
        <section className="admin-empty gallery-admin-empty">
          <GalleryVerticalEnd aria-hidden="true" />
          <h2>No client galleries yet.</h2>
          <p>Create your first event gallery to begin delivering photography through DFB Solutions.</p>
          <button className="btn btn-primary" onClick={() => setEditor({ event: null })}><Plus />Create Event</button>
        </section>
      ) : (
        <section className="gallery-admin-list" aria-label="Event galleries">
          {events.map((event) => {
            const status = getEventStatus(event);
            return <article className="gallery-admin-card" key={event.id}>
              <div className="gallery-admin-card-main">
                <div className="gallery-admin-card-top">
                  <span className={`gallery-status-badge is-${status.toLowerCase()}`}>{status}</span>
                  <small>{event.photoCount} {event.photoCount === 1 ? "photo" : "photos"}</small>
                </div>
                <h2>{event.title}</h2>
                <dl>
                  <div><dt>Event date</dt><dd>{formatEventDate(event.eventDate) || "Not set"}</dd></div>
                  <div><dt>Private code</dt><dd className="gallery-code-hint">{event.codeHint || "Configured"}</dd></div>
                  <div><dt>Expiration</dt><dd>{event.expiresAt ? formatDateTime(event.expiresAt) : "No expiration"}</dd></div>
                  <div><dt>Updated</dt><dd>{formatDateTime(event.updatedAt)}</dd></div>
                </dl>
              </div>
              <div className="gallery-admin-actions">
                <button onClick={() => setEditor({ event })}><Edit3 />Edit</button>
                <button onClick={() => setResetting(event)}><KeyRound />Reset Code</button>
                {!event.archivedAt && <button onClick={() => setConfirming(publishConfirmation(event))}>{event.published ? <EyeOff /> : <Eye />}{event.published ? "Unpublish" : "Publish"}</button>}
                <button className={event.archivedAt ? "" : "danger"} onClick={() => setConfirming(archiveConfirmation(event))}>
                  {event.archivedAt ? <RotateCcw /> : <Archive />}{event.archivedAt ? "Unarchive" : "Archive"}
                </button>
              </div>
            </article>;
          })}
        </section>
      )}

      {editor && <GalleryEditorModal event={editor.event} onClose={() => setEditor(null)} onSave={saveEvent} />}
      {resetting && <ResetCodeModal event={resetting} onClose={() => setResetting(null)} onReset={resetCode} />}
      {confirming && <ConfirmationModal confirmation={confirming} busy={acting} onClose={() => !acting && setConfirming(null)} onConfirm={performConfirmedAction} />}
      {codeReveal && <CodeRevealModal {...codeReveal} onClose={() => setCodeReveal(null)} />}
    </div>
  );
}

function GalleryEditorModal({ event, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    title: event?.title || "",
    eventDate: toDateInput(event?.eventDate),
    expiresAt: toDateTimeInput(event?.expiresAt),
    downloadsEnabled: event ? event.downloadsEnabled : true,
    published: event ? event.published : false,
    codeMode: "generate",
    eventCode: "",
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(submitEvent) {
    submitEvent.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    const payload = {
      title: form.title.trim(),
      eventDate: form.eventDate ? localDateToIso(form.eventDate) : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      downloadsEnabled: form.downloadsEnabled,
      published: form.published,
    };
    if (!event) {
      if (form.codeMode === "generate") payload.generateCode = true;
      else payload.eventCode = form.eventCode;
    }
    try {
      await onSave(payload, event);
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  }

  return <AdminModal title={event ? "Edit Event Gallery" : "Create Event Gallery"} eyebrow={event ? "Update private event" : "New private event"} onClose={onClose} locked={saving}>
    <form className="gallery-admin-form" onSubmit={submit}>
      <div className="editor-fields">
        <label className="wide"><span>Event Title<i>Required</i></span><input autoFocus value={form.title} maxLength={200} required onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label><span>Event Date<i>Optional</i></span><input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} /></label>
        <label><span>Expiration<i>Optional</i></span><input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} /></label>
        {!event && <fieldset className="wide gallery-code-choice"><legend>Event Code</legend>
          <label><input type="radio" name="codeMode" checked={form.codeMode === "generate"} onChange={() => setForm({ ...form, codeMode: "generate", eventCode: "" })} /><span><strong>Generate Secure Code</strong><small>Let the server create a private human-friendly code.</small></span></label>
          <label><input type="radio" name="codeMode" checked={form.codeMode === "custom"} onChange={() => setForm({ ...form, codeMode: "custom" })} /><span><strong>Choose My Own Code</strong><small>Letters, numbers, and hyphens only.</small></span></label>
          {form.codeMode === "custom" && <label className="gallery-custom-code"><span>Custom event code<i>Required</i></span><input value={form.eventCode} required placeholder="EX: ANDREA80" autoCapitalize="characters" onChange={(e) => setForm({ ...form, eventCode: e.target.value.toUpperCase() })} /></label>}
        </fieldset>}
        <label className="admin-checkbox"><input type="checkbox" checked={form.downloadsEnabled} onChange={(e) => setForm({ ...form, downloadsEnabled: e.target.checked })} /><span>Allow Full-Resolution Downloads</span></label>
        <label className="admin-checkbox"><input type="checkbox" checked={form.published} disabled={Boolean(event?.archivedAt)} onChange={(e) => setForm({ ...form, published: e.target.checked })} /><span>{event?.archivedAt ? "Published (Unarchive First)" : "Published"}</span></label>
      </div>
      {error && <p className="admin-message is-error" role="alert">{error}</p>}
      <footer><button className="btn btn-secondary" type="button" onClick={onClose} disabled={saving}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : event ? "Save Changes" : "Create Event"}</button></footer>
    </form>
  </AdminModal>;
}

function ResetCodeModal({ event, onClose, onReset }) {
  const [mode, setMode] = useState("generate");
  const [eventCode, setEventCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(submitEvent) {
    submitEvent.preventDefault();
    setSaving(true); setError("");
    try { await onReset(mode === "generate" ? { generateCode: true } : { eventCode }); }
    catch (requestError) { setError(requestError.message); setSaving(false); }
  }
  return <AdminModal title="Reset Event Code" eyebrow={event.title} onClose={onClose} locked={saving}>
    <form className="gallery-admin-form reset-code-form" onSubmit={submit}>
      <p className="gallery-security-note">Resetting this code immediately invalidates the old event code and all existing client gallery sessions.</p>
      <div className="gallery-code-choice">
        <label><input type="radio" checked={mode === "generate"} onChange={() => { setMode("generate"); setEventCode(""); }} /><span><strong>Generate New Code</strong><small>Recommended for a strong private code.</small></span></label>
        <label><input type="radio" checked={mode === "custom"} onChange={() => setMode("custom")} /><span><strong>Choose New Code</strong><small>Use letters, numbers, and hyphens.</small></span></label>
      </div>
      {mode === "custom" && <label><span>New event code</span><input autoFocus value={eventCode} required placeholder="EX: ANDREA80" onChange={(e) => setEventCode(e.target.value.toUpperCase())} /></label>}
      {error && <p className="admin-message is-error" role="alert">{error}</p>}
      <footer><button className="btn btn-secondary" type="button" onClick={onClose} disabled={saving}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? "Resetting…" : "Reset Event Code"}</button></footer>
    </form>
  </AdminModal>;
}

function ConfirmationModal({ confirmation, busy, onClose, onConfirm }) {
  return <AdminModal title={confirmation.title} eyebrow={confirmation.event.title} onClose={onClose} locked={busy} compact>
    <div className="gallery-confirmation"><p>{confirmation.description}</p><footer><button className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancel</button><button className={`btn ${confirmation.danger ? "gallery-danger-button" : "btn-primary"}`} onClick={onConfirm} disabled={busy}>{busy ? "Working…" : confirmation.label}</button></footer></div>
  </AdminModal>;
}

function CodeRevealModal({ title, code, onClose }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(true); }
    catch { setCopied(false); }
  }
  return <AdminModal title={title} eyebrow="Save this private code" onClose={onClose} compact>
    <div className="gallery-code-reveal">
      <KeyRound aria-hidden="true" />
      <code>{code}</code>
      <button className="btn btn-primary" onClick={copy}>{copied ? <Check /> : <Clipboard />}{copied ? "Copied" : "Copy Code"}</button>
      <p>Save this code now. For security, DFB does not store the full event code and it cannot be viewed again later.</p>
    </div>
  </AdminModal>;
}

function AdminModal({ title, eyebrow, children, onClose, locked = false, compact = false }) {
  useEffect(() => {
    function closeOnEscape(event) { if (event.key === "Escape" && !locked) onClose(); }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [locked, onClose]);
  return <div className="editor-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !locked && onClose()}>
    <section className={`record-editor gallery-admin-modal ${compact ? "is-compact" : ""}`} role="dialog" aria-modal="true" aria-labelledby="gallery-admin-modal-title">
      <header><div><p className="eyebrow">{eyebrow}</p><h2 id="gallery-admin-modal-title">{title}</h2></div><button aria-label="Close dialog" onClick={onClose} disabled={locked}><X /></button></header>
      {children}
    </section>
  </div>;
}

function publishConfirmation(event) {
  return event.published ? {
    event, action: "unpublish", title: "Unpublish Gallery?", label: "Unpublish Gallery", danger: true,
    description: "Clients will immediately lose access to this event until it is intentionally published again.",
    success: "Event gallery unpublished. Client access has been removed.",
  } : {
    event, action: "publish", title: "Publish Gallery?", label: "Publish Gallery", danger: false,
    description: "Clients with the current private event code will be able to access this gallery.",
    success: "Event gallery published.",
  };
}

function archiveConfirmation(event) {
  return event.archivedAt ? {
    event, action: "unarchive", title: "Unarchive Gallery?", label: "Unarchive", danger: false,
    description: "The event will return to Draft status. It will remain unavailable to clients until you publish it.",
    success: "Event gallery unarchived and left unpublished.",
  } : {
    event, action: "archive", title: "Archive Gallery?", label: "Archive Gallery", danger: true,
    description: "Archiving removes client access but keeps the event record for DFB administration.",
    success: "Event gallery archived.",
  };
}

function getEventStatus(event) {
  if (event.archivedAt) return "Archived";
  if (event.expiresAt && new Date(event.expiresAt) <= new Date()) return "Expired";
  return event.published ? "Published" : "Draft";
}

function formatEventDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function toDateTimeInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function localDateToIso(value) {
  return new Date(`${value}T12:00:00`).toISOString();
}
