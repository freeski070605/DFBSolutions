import { Check, ChevronDown, Clock3, Eye, FileText, Globe2, ImagePlus, Images, Monitor, Search, Smartphone, Tablet, UploadCloud, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { fallbackSiteContent } from "../../context/ContentContext.jsx";
import { servicePages } from "../../data/servicePages.js";

const schema = {
  home: { title: "Home", path: "/", sections: [
    { title: "Hero", description: "The first message and image visitors see.", fields: [
      { key: "eyebrow", label: "Intro Label" }, { key: "headline", label: "Headline", maxLength: 120 },
      { key: "intro", label: "Supporting Text", type: "textarea" }, { key: "heroMedia", label: "Hero Image", type: "image", dimensions: "1600 × 900 · wide landscape" },
      { key: "primaryCtaLabel", label: "Primary Button Text" }, { key: "primaryCtaLink", label: "Primary Button Destination", type: "link" },
      { key: "secondaryCtaLabel", label: "Secondary Button Text" }, { key: "secondaryCtaLink", label: "Secondary Button Destination", type: "link" },
    ] },
    { title: "Services", description: "The featured service cards on the homepage.", fields: [{ key: "featuredServiceSlugs", label: "Featured Services", type: "services" }] },
    { title: "Additional Solutions", description: "The short introduction above transportation and property.", fields: [
      { key: "additionalHeading", label: "Section Label" }, { key: "additionalCopy", label: "Description", type: "textarea" },
    ] },
  ] },
  about: { title: "About", path: "/about", sections: [
    { title: "Page Introduction", description: "The opening message on the About page.", fields: [
      { key: "headline", label: "Headline", maxLength: 120 }, { key: "intro", label: "Supporting Text", type: "textarea" },
      { key: "heroMedia", label: "About Image", type: "image", dimensions: "1600 × 900 · wide landscape" },
    ] },
    { title: "Our Story", description: "The story visitors read below the introduction.", fields: [{ key: "story", label: "Story", type: "textarea" }] },
    { title: "Mission", description: "The highlighted statement on the About page.", fields: [{ key: "mission", label: "Mission Statement", type: "textarea" }] },
  ] },
  global: { title: "Global Content", path: "/", sections: [
    { title: "How It Works", description: "The process introduction shown on Home.", fields: [{ key: "processIntro", label: "Process Introduction", type: "textarea" }] },
    { title: "Professional Standards", description: "The trust statement shown on Home.", fields: [
      { key: "trustCopy", label: "Trust Statement", type: "textarea" },
    ] },
  ] },
};
const routes = [
  ["Contact", "/contact"], ["Pricing", "/pricing"], ["Photography", "/photography"],
  ["Videography", "/videography"], ["Websites", "/websites"], ["Branding", "/branding"],
  ["Transportation", "/solutions/transportation"], ["Digital Solutions", "/solutions/digital"],
  ["Home & Property", "/solutions/property"], ["Work", "/work"], ["About", "/about"], ["Home", "/"],
];
const formatDate = (value) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) : "Not yet";
const request = async (url, options = {}) => {
  const response = await fetch(url, { credentials: "same-origin", headers: { "Content-Type": "application/json", ...options.headers }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) throw new Error(data.message || "The request could not be completed.");
  return data;
};
const clone = (value) => JSON.parse(JSON.stringify(value));
const sectionText = (section, content) => section.fields.map(({ key }) => key === "heroMedia" ? content?.heroMedia?.alt : content?.[key]).filter((value) => typeof value === "string").join(" ");

export default function SiteContentManager({ onDirtyChange, onNavigate }) {
  const [pageList, setPageList] = useState([]);
  const [selected, setSelected] = useState("home");
  const [pageData, setPageData] = useState(null);
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(null);
  const [openSection, setOpenSection] = useState(0);
  const [search, setSearch] = useState("");
  const [remoteSearch, setRemoteSearch] = useState({ matchingPages: [], media: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [preview, setPreview] = useState(false);
  const [device, setDevice] = useState("desktop");
  const [picker, setPicker] = useState(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [history, setHistory] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const toastTimer = useRef();
  const confirmRef = useRef();
  const dirty = form && saved && JSON.stringify(form) !== JSON.stringify(saved);
  useEffect(() => { onDirtyChange(Boolean(dirty)); }, [dirty, onDirtyChange]);
  useEffect(() => {
    const beforeUnload = (event) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useEffect(() => {
    if (!confirmPublish) return;
    confirmRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") setConfirmPublish(false);
      if (event.key !== "Tab") return;
      const buttons = [...confirmRef.current.querySelectorAll("button:not(:disabled)")];
      if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === buttons.at(-1)) { event.preventDefault(); buttons[0].focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirmPublish]);
  const announce = (message) => { setToast(message); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(""), 3500); };
  const loadList = useCallback(async () => {
    try { const data = await request("/api/admin/site-content"); setPageList(data.pages || []); }
    catch (failure) { setError(failure.message); }
  }, []);
  const loadPage = useCallback(async (key) => {
    setLoading(true); setError(""); setPageData(null);
    try {
      const data = await request(`/api/admin/site-content?page=${key}`);
      const content = { ...clone(fallbackSiteContent[key]), ...(data.draft || data.live) };
      setPageData(data); setForm(content); setSaved(clone(content)); setOpenSection(0);
    } catch (failure) { setError("We couldn't load Site Content right now. " + failure.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { loadPage(selected); }, [selected, loadPage]);
  useEffect(() => {
    if (!search.trim()) { setRemoteSearch({ matchingPages: [], media: [] }); return; }
    let active = true;
    const timer = setTimeout(() => request(`/api/admin/site-content?search=${encodeURIComponent(search.trim())}`).then((data) => { if (active) setRemoteSearch(data); }).catch(() => {}), 250);
    return () => { active = false; clearTimeout(timer); };
  }, [search]);
  const choosePage = (key) => {
    if (key === selected) { setMobileNav(false); return; }
    if (dirty && !window.confirm("You have unsaved changes. Discard changes and leave?")) return;
    setSelected(key); setMobileNav(false); setPreview(false); setHistory(null);
  };
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const save = async () => {
    setBusy(true); setError("");
    const submitted = clone(form);
    try {
      const data = await request(`/api/admin/site-content?page=${selected}`, { method: "PUT", body: JSON.stringify({ content: submitted }) });
      setForm((current) => JSON.stringify(current) === JSON.stringify(submitted) ? clone(data.content) : current);
      setSaved(clone(data.content)); setPageData((current) => ({ ...current, draft: clone(data.content), updatedAt: data.updatedAt }));
      loadList(); announce("Draft saved");
      return true;
    } catch (failure) { setError(failure.message); return false; }
    finally { setBusy(false); }
  };
  const publish = async () => {
    setBusy(true); setError("");
    try {
      await request(`/api/admin/site-content?page=${selected}`, { method: "POST", body: JSON.stringify({ content: form }) });
      setPageData((current) => ({ ...current, live: clone(form), draft: null, publishedAt: new Date().toISOString() }));
      setConfirmPublish(false); loadList(); announce("Changes published successfully.");
    } catch (failure) { setConfirmPublish(false); setError(failure.message); }
    finally { setBusy(false); }
  };
  const changes = schema[selected].sections.flatMap((section) => section.fields.filter(({ key }) => JSON.stringify(form?.[key]) !== JSON.stringify(pageData?.live?.[key])).map((field) => `${section.title}: ${field.label}`));
  const searchResults = Object.entries(schema).flatMap(([key, page]) => page.sections.map((section, index) => ({ key, index, title: section.title, page: page.title, text: sectionText(section, key === selected ? form : null) }))).filter((item) => `${item.page} ${item.title} ${item.text}`.toLowerCase().includes(search.toLowerCase()));
  for (const key of remoteSearch.matchingPages || []) if (!searchResults.some((result) => result.key === key)) searchResults.push({ key, title: schema[key].title, page: "Page content" });
  return <div className="site-cms">
    <header className="site-cms-intro"><p className="eyebrow">Website editor</p><h1>Site Content</h1><p>Choose a page, update a section, and publish when it is ready.</p></header>
    <button className="site-cms-mobile-nav" onClick={() => setMobileNav(!mobileNav)} aria-expanded={mobileNav}><FileText size={18} /> {schema[selected].title} <ChevronDown size={16} /></button>
    <div className="site-cms-layout">
      <aside className={`site-cms-nav ${mobileNav ? "is-open" : ""}`}>
        <label className="site-cms-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search pages or content…" /></label>
        <p className="site-cms-nav-label">Website Pages</p>
        {(search ? searchResults : Object.entries(schema).filter(([key]) => key !== "global").map(([key, page]) => ({ key, title: page.title }))).filter((item) => item.key !== "global").map((item, index) => {
          const info = pageList.find((page) => page.key === item.key);
          return <button key={`${item.key}-${item.index ?? index}`} className={selected === item.key ? "active" : ""} onClick={() => { choosePage(item.key); if (item.index != null) setOpenSection(item.index); }}>
            <span><strong>{item.title}</strong>{item.page && <small>{item.page}</small>}<small>{info?.hasDraft ? "Draft saved" : "Live"} · {formatDate(info?.updatedAt)}</small></span>{selected === item.key && dirty && <i aria-label="Unsaved changes" />}
          </button>;
        })}
        {!searchResults.length && !remoteSearch.media?.length && search && <p className="site-cms-nav-empty">No matching content.</p>}
        <p className="site-cms-nav-label">Shared & media</p>
        <button className={selected === "global" ? "active" : ""} onClick={() => choosePage("global")}><Globe2 size={17} /><span><strong>Global Content</strong><small>Copy used across pages</small></span></button>
        <button onClick={() => setPicker({ library: true })}><Images size={17} /><span><strong>Media Library</strong><small>Browse uploaded images</small></span></button>
        {search && remoteSearch.media?.map((asset) => <button key={asset.id} onClick={() => setPicker({ library: true, initialSearch: asset.filename })}><Images size={17} /><span><strong>{asset.filename}</strong><small>Media Library</small></span></button>)}
        <div className="site-cms-related"><p className="site-cms-nav-label">Other editable content</p><button onClick={() => onNavigate("services")}>Service pages →</button><button onClick={() => onNavigate("projects")}>Portfolio projects →</button><button onClick={() => onNavigate("testimonials")}>Testimonials →</button></div>
      </aside>
      <div className="site-cms-workspace">
        <div className="site-cms-toolbar"><div><p className="eyebrow">{selected === "global" ? "Shared across the site" : "Website page"}</p><h2>{schema[selected].title}{selected === "global" ? "" : " Page"}</h2><div className="site-cms-status"><span>{pageData?.draft ? "Draft saved" : "Live"}</span><small>Last published {formatDate(pageData?.publishedAt)}</small>{dirty && <em>Unsaved changes</em>}</div></div><div className="site-cms-actions"><button className="btn btn-secondary" onClick={() => setPreview(!preview)} disabled={!form}><Eye size={16} /> {preview ? "Edit" : "Preview"}</button><button className="btn btn-secondary" onClick={save} disabled={!form || busy || !dirty}>Save Draft</button><button className="btn btn-primary" onClick={() => setConfirmPublish(true)} disabled={!form || busy || dirty || !pageData?.draft}>Publish Changes</button></div></div>
        {error && <div className="admin-message is-error" role="alert">{error} <button onClick={() => { loadList(); loadPage(selected); }}>Try Again</button></div>}
        {loading ? <div className="site-cms-skeleton"><div /><div /><div /></div> : form && <>
          {selected === "global" && <p className="site-cms-notice">These shared messages currently appear on the Home page.</p>}
          {preview ? <ContentPreview page={schema[selected]} content={form} device={device} onDevice={setDevice} /> : <div className="site-cms-sections">
            <p className="site-cms-section-heading">{schema[selected].sections.length} editable sections</p>
            {schema[selected].sections.map((section, index) => <SectionCard key={section.title} section={section} index={index} content={form} open={openSection === index} onToggle={() => setOpenSection(openSection === index ? -1 : index)} onChange={update} onPick={(field) => setPicker({ field })} />)}
          </div>}
          <div className="site-cms-history"><button onClick={async () => { if (history) { setHistory(null); return; } try { const data = await request(`/api/admin/site-content?page=${selected}&history=1`); setHistory(data.history); } catch (failure) { setError(failure.message); } }}><Clock3 size={16} /> {history ? "Hide" : "View"} content history</button>{history && <div>{history.length ? history.map((version) => <article key={version._id}><span>{version.status} · {formatDate(version.createdAt)} · {version.updatedBy}</span><button onClick={() => { if (dirty && !window.confirm("Replace your unsaved changes with this version?")) return; setForm(clone(version.content)); setPreview(false); announce("Version loaded. Save a draft to keep it."); }}>View / restore</button></article>) : <p>No saved versions yet.</p>}</div>}</div>
        </>}
      </div>
    </div>
    {picker && <MediaPicker initialSearch={picker.initialSearch} onClose={() => setPicker(null)} onSelect={(asset) => { if (picker.field) update(picker.field.key, { src: asset.url, alt: asset.altText || "", type: "image" }); setPicker(null); }} />}
    {confirmPublish && <div className="site-cms-overlay" onMouseDown={(event) => event.target === event.currentTarget && setConfirmPublish(false)}><section role="dialog" aria-modal="true" aria-label="Publish changes" tabIndex={-1} ref={confirmRef}><h2>Publish changes to {schema[selected].title}?</h2><p>The saved draft will become visible on the public website.</p><ul>{changes.length ? changes.map((change) => <li key={change}>{change}</li>) : <li>Saved content will be published.</li>}</ul><div><button className="btn btn-secondary" onClick={() => setConfirmPublish(false)}>Cancel</button><button className="btn btn-primary" onClick={publish} disabled={busy}>Publish</button></div></section></div>}
    {toast && <div className="site-cms-toast" role="status"><Check size={16} />{toast}</div>}
  </div>;
}

function SectionCard({ section, index, content, open, onToggle, onChange, onPick }) {
  const image = section.fields.find((field) => field.type === "image");
  return <section className={`site-cms-section ${open ? "is-open" : ""}`}><button className="site-cms-section-top" onClick={onToggle} aria-expanded={open}><span className="site-cms-section-thumb">{image && content[image.key]?.src ? <img src={content[image.key].src} alt="" /> : <FileText size={20} />}</span><span className="site-cms-section-title"><small>0{index + 1} / Section</small><strong>{section.title}</strong><span>{section.description}</span></span><span className="site-cms-edit-word">{open ? "Close" : "Edit"}</span><ChevronDown size={18} /></button>{open && <div className="site-cms-fields">{section.fields.map((field) => <ContentField key={field.key} field={field} value={content[field.key]} onChange={(value) => onChange(field.key, value)} onPick={() => onPick(field)} />)}</div>}</section>;
}

function ContentField({ field, value, onChange, onPick }) {
  if (field.type === "image") return <div className="site-cms-image-field"><div><strong>{field.label}</strong><small>Recommended: {field.dimensions}</small></div>{value?.src ? value.type === "video" ? <video src={value.src} poster={value.poster} controls /> : <img src={value.src} alt={value.alt || ""} style={{ objectPosition: `${value.focalPoint?.x ?? 50}% ${value.focalPoint?.y ?? 50}%` }} /> : <div className="site-cms-image-empty"><ImagePlus /><span>No image selected</span></div>}<div className="site-cms-image-actions"><button type="button" onClick={onPick}>{value?.src ? "Replace Image" : "Choose Image"}</button>{value?.src && <button type="button" onClick={() => onChange(null)}>Remove Image</button>}</div>{value?.src && value.type !== "video" && <><label>Image Description / Alt Text<input value={value.alt || ""} onChange={(event) => onChange({ ...value, alt: event.target.value })} placeholder="Describe the image for visitors using screen readers." /></label><label>Image Focal Point<select value={`${value.focalPoint?.x ?? 50},${value.focalPoint?.y ?? 50}`} onChange={(event) => { const [x, y] = event.target.value.split(",").map(Number); onChange({ ...value, focalPoint: { x, y } }); }}><option value="50,50">Center</option><option value="50,25">Top</option><option value="50,75">Bottom</option><option value="25,50">Left</option><option value="75,50">Right</option><option value="25,25">Top left</option><option value="75,25">Top right</option><option value="25,75">Bottom left</option><option value="75,75">Bottom right</option></select></label></>}</div>;
  if (field.type === "link") return <LinkEditor field={field} value={value || ""} onChange={onChange} />;
  if (field.type === "services") return <ServicesField value={value} onChange={onChange} />;
  return <label className="site-cms-field">{field.label}{field.type === "textarea" ? <textarea rows={5} value={value || ""} onChange={(event) => onChange(event.target.value)} /> : <input value={value || ""} maxLength={field.maxLength} onChange={(event) => onChange(event.target.value)} />}{field.maxLength && <small>{String(value || "").length} / {field.maxLength}</small>}</label>;
}

function ServicesField({ value, onChange }) {
  const [options, setOptions] = useState(servicePages);
  useEffect(() => { let active = true; request("/api/content/services").then((data) => { if (active && data.items?.length) setOptions(data.items); }).catch(() => {}); return () => { active = false; }; }, []);
  const chosen = Array.isArray(value) ? value : ["photography", "videography", "websites", "branding"];
  return <fieldset className="site-cms-service-options"><legend>Featured Services</legend><p>Choose up to four services to show on Home.</p>{options.filter((service) => service.active !== false).map((service) => <label key={service.slug}><input type="checkbox" checked={chosen.includes(service.slug)} disabled={!chosen.includes(service.slug) && chosen.length >= 4} onChange={(event) => onChange(event.target.checked ? [...chosen, service.slug] : chosen.filter((slug) => slug !== service.slug))} />{service.name}</label>)}</fieldset>;
}

function LinkEditor({ field, value, onChange }) {
  const kind = value.startsWith("tel:") ? "phone" : value.startsWith("mailto:") ? "email" : /^https?:/.test(value) ? "external" : "page";
  return <div className="site-cms-link"><strong>{field.label}</strong><div><select aria-label="Destination type" value={kind} onChange={(event) => onChange(event.target.value === "phone" ? "tel:" : event.target.value === "email" ? "mailto:" : event.target.value === "external" ? "https://" : "/contact")}><option value="page">Website page</option><option value="external">External URL</option><option value="phone">Phone</option><option value="email">Email</option></select>{kind === "page" ? <select aria-label="Website page" value={value} onChange={(event) => onChange(event.target.value)}>{!routes.some((route) => route[1] === value) && <option value={value}>{value || "Select a page"}</option>}{routes.map(([name, path]) => <option key={path} value={path}>{name}</option>)}</select> : <input aria-label="Destination" value={kind === "phone" ? value.slice(4) : kind === "email" ? value.slice(7) : value} onChange={(event) => onChange((kind === "phone" ? "tel:" : kind === "email" ? "mailto:" : "") + event.target.value)} />}</div><small>Visitors will go to: {value || "No destination"}</small></div>;
}

function ContentPreview({ page, content, device, onDevice }) {
  return <div className="site-cms-preview"><div className="site-cms-preview-bar"><strong>Preview — Not Live</strong><div>{[[Monitor, "desktop"], [Tablet, "tablet"], [Smartphone, "mobile"]].map(([Icon, mode]) => <button key={mode} className={device === mode ? "active" : ""} onClick={() => onDevice(mode)} aria-label={mode} title={mode}><Icon size={17} /></button>)}</div><a href={page.path} target="_blank" rel="noreferrer">Open live page ↗</a></div><div className={`site-cms-preview-frame is-${device}`}><div className="site-cms-preview-brand">DFB. <span>Website preview</span></div>{page.sections.map((section) => <section key={section.title}><p className="eyebrow">{section.title}</p>{section.fields.filter((field) => field.type !== "link" && field.type !== "services").map((field) => field.type === "image" ? content[field.key]?.src && (content[field.key].type === "video" ? <video key={field.key} src={content[field.key].src} poster={content[field.key].poster} controls /> : <img key={field.key} src={content[field.key].src} alt={content[field.key].alt || ""} style={{ objectPosition: `${content[field.key].focalPoint?.x ?? 50}% ${content[field.key].focalPoint?.y ?? 50}%` }} />) : field.key.toLowerCase().includes("headline") || field.key === "mission" ? <h2 key={field.key}>{content[field.key]}</h2> : <p key={field.key}>{content[field.key]}</p>)}</section>)}</div><p className="site-cms-preview-note">This preview shows editable content and approximate section layout. Open the live page to compare the current published design.</p></div>;
}

function MediaPicker({ initialSearch = "", onClose, onSelect }) {
  const [tab, setTab] = useState("library");
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const input = useRef();
  const dialog = useRef();
  const load = useCallback(async (nextPage = 1, query = search) => {
    setLoading(true); setError("");
    try { const data = await request(`/api/admin/site-media?page=${nextPage}&search=${encodeURIComponent(query)}&sort=${sort}`); setAssets((current) => nextPage === 1 ? data.items : [...current, ...data.items]); setMore(data.hasMore); setPage(nextPage); }
    catch (failure) { setError("We couldn't load the media library. " + failure.message); }
    finally { setLoading(false); }
  }, [search, sort]);
  useEffect(() => { const timer = setTimeout(() => load(1, search), 220); return () => clearTimeout(timer); }, [search, load]);
  useEffect(() => { dialog.current?.focus(); const onKey = (event) => { if (event.key === "Escape") onClose(); if (event.key === "Tab") { const focusable = [...dialog.current.querySelectorAll("button:not(:disabled),input:not(:disabled)")]; if (!focusable.length) return; if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1).focus(); } else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); } } }; document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey); }, [onClose]);
  useEffect(() => { if (!file) { setFilePreview(""); return; } const url = URL.createObjectURL(file); setFilePreview(url); return () => URL.revokeObjectURL(url); }, [file]);
  const chooseFile = (next) => { if (!next) return; if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(next.type)) { setError("Use a JPG, PNG, WebP, or AVIF image."); return; } if (next.size > 10 * 1024 * 1024) { setError("Image must be 10 MB or smaller."); return; } setError(""); setFile(next); setTab("upload"); };
  const upload = async () => {
    if (!file) return;
    setError(""); setProgress(1);
    try {
      const dimensions = await new Promise((resolve) => { const img = new Image(); const url = URL.createObjectURL(file); img.onload = () => { resolve({ width: img.width, height: img.height }); URL.revokeObjectURL(url); }; img.onerror = () => { resolve({}); URL.revokeObjectURL(url); }; img.src = url; });
      const reserved = await request("/api/admin/site-media", { method: "POST", body: JSON.stringify({ action: "reserve", filename: file.name, mimeType: file.type, fileSize: file.size, ...dimensions }) });
      await new Promise((resolve, reject) => { const xhr = new XMLHttpRequest(); xhr.open("PUT", reserved.uploadUrl); xhr.setRequestHeader("Content-Type", file.type); xhr.upload.onprogress = (event) => event.lengthComputable && setProgress(Math.round(event.loaded / event.total * 100)); xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed. Try again.")); xhr.onerror = () => reject(new Error("Upload failed. Try again.")); xhr.send(file); });
      const complete = await request("/api/admin/site-media", { method: "POST", body: JSON.stringify({ action: "complete", id: reserved.id, altText: "" }) });
      setSelected(complete.item); setFile(null); setTab("library"); load(1); setProgress(0);
    } catch (failure) { setError(failure.message); setProgress(0); }
  };
  const updateAlt = async (value) => { setSelected((current) => ({ ...current, altText: value })); };
  const useImage = async () => { if (!selected) return; try { await request("/api/admin/site-media", { method: "PUT", body: JSON.stringify({ id: selected._id || selected.id, altText: selected.altText || "" }) }); onSelect(selected); } catch (failure) { setError(failure.message); } };
  const remove = async () => { if (!selected || !window.confirm(`Delete “${selected.filename}”? This cannot be undone.`)) return; try { await request(`/api/admin/site-media?id=${selected._id || selected.id}`, { method: "DELETE" }); setSelected(null); load(1); } catch (failure) { setError(failure.message); } };
  return <div className="site-cms-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="site-cms-media" role="dialog" aria-modal="true" aria-label="Media Library" tabIndex={-1} ref={dialog}><header><div><p className="eyebrow">Website assets</p><h2>Media Library</h2></div><button onClick={onClose} aria-label="Close media library"><X /></button></header><nav><button className={tab === "library" ? "active" : ""} onClick={() => setTab("library")}>Media Library</button><button className={tab === "upload" ? "active" : ""} onClick={() => setTab("upload")}>Upload New</button></nav>{error && <p className="admin-message is-error" role="alert">{error} <button onClick={() => load(1)}>Try Again</button></p>}{tab === "upload" ? <div className="site-cms-upload"><div className={dragging ? "is-dragging" : ""} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]); }}><UploadCloud size={34} /><h3>Drag an image here</h3><p>JPG, PNG, WebP, or AVIF · up to 10 MB</p><button onClick={() => input.current?.click()}>Browse files</button><input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => chooseFile(event.target.files[0])} /></div>{file && <div className="site-cms-upload-ready">{filePreview && <img src={filePreview} alt="Image ready to upload" />}<span>{file.name}<small>{(file.size / 1048576).toFixed(1)} MB</small></span><button onClick={upload} disabled={progress > 0}>{progress ? `Uploading ${progress}%` : "Upload Image"}</button></div>}</div> : <div className="site-cms-media-body"><label className="site-cms-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search media…" /></label><select className="site-cms-media-sort" aria-label="Sort media" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select>{loading && !assets.length ? <p>Loading media…</p> : assets.length ? <><div className="site-cms-media-grid">{assets.map((asset) => <button key={asset._id} className={selected?._id === asset._id ? "active" : ""} onClick={() => setSelected(asset)}><img src={asset.url} alt="" loading="lazy" /><span>{asset.filename}</span><small>{formatDate(asset.createdAt)} · {asset.width && asset.height ? `${asset.width} × ${asset.height}` : "Image"}</small></button>)}</div>{more && <button className="site-cms-more" onClick={() => load(page + 1)} disabled={loading}>Load more</button>}</> : <div className="site-cms-media-empty"><Images size={30} /><h3>No media uploaded yet.</h3><button onClick={() => setTab("upload")}>Upload Media</button></div>}</div>}{selected && <footer><img src={selected.url} alt="" /><div><strong>{selected.filename}</strong><small>{selected.width && selected.height ? `${selected.width} × ${selected.height} · ` : ""}{(selected.fileSize / 1048576).toFixed(1)} MB</small><label>Image Description / Alt Text<input value={selected.altText || ""} onChange={(event) => updateAlt(event.target.value)} placeholder="Describe this image for screen readers" /></label></div>{selected.usageCount > 0 && <small className="site-cms-media-used">Used in {selected.usageCount} locations</small>}<button className="site-cms-delete" onClick={remove} disabled={selected.usageCount > 0}>Delete</button><button className="btn btn-primary" onClick={useImage}>Use Image</button></footer>}</section></div>;
}
