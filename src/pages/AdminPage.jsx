import { CalendarDays, FolderKanban, LayoutDashboard, LogOut, Menu, Search, Settings, Users, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Seo from "../components/Seo.jsx";

const resources = {
  divisions: {
    label: "Site Divisions", endpoint: "/api/admin/divisions", icon: Settings,
    fields: [
      ["name", "Division name", "text", true], ["shortName", "Short name", "text", true], ["slug", "URL slug", "text", true],
      ["accent", "Accent color", "color"], ["statement", "Supporting statement", "textarea"], ["prompt", "Problem prompt", "textarea"],
      ["intro", "Division introduction", "textarea"], ["problems", "Problems solved — one per line", "lines"],
      ["capabilities", "Capabilities — one per line", "lines"], ["process", "Process steps — one per line", "lines"],
      ["faqs", "FAQs — question | answer, one per line", "pairs"], ["sortOrder", "Sort order", "number"], ["published", "Published", "checkbox"],
    ],
    summary: (item) => item.statement || item.intro,
  },
  inquiries: {
    label: "Inquiries", endpoint: "/api/admin/inquiries", icon: Menu,
    fields: [
      ["name", "Name", "text", true], ["email", "Email", "email", true], ["phone", "Phone"],
      ["inquiryType", "Division", "select", false, ["digital", "creative", "property", "transportation", "unsure"]],
      ["status", "Status", "select", true, ["new", "contacted", "qualified", "proposal", "won", "lost", "archived"]],
      ["assignedTo", "Assigned to"], ["notes", "Internal notes", "textarea"],
    ],
    summary: (item) => item.details?.projectGoal || item.details?.projectKind || item.email,
  },
  customers: {
    label: "Customers", endpoint: "/api/admin/customers", icon: Users,
    fields: [
      ["name", "Name", "text", true], ["email", "Email", "email"], ["phone", "Phone"], ["company", "Company"],
      ["status", "Status", "select", true, ["lead", "active", "past", "inactive"]],
      ["city", "City / ZIP"], ["divisions", "Divisions", "lines"], ["tags", "Tags", "lines"], ["notes", "Notes", "textarea"],
    ],
    summary: (item) => item.company || item.email || item.phone || "Customer record",
  },
  bookings: {
    label: "Bookings & Projects", endpoint: "/api/admin/bookings", icon: CalendarDays,
    fields: [
      ["title", "Booking / project title", "text", true], ["customerName", "Customer"], ["customerId", "Customer record ID"],
      ["division", "Division", "select", true, ["digital", "creative", "property", "transportation"]],
      ["type", "Type"], ["status", "Status", "select", true, ["inquiry", "tentative", "confirmed", "in-progress", "completed", "cancelled"]],
      ["startAt", "Start date/time", "datetime-local"], ["endAt", "End date/time", "datetime-local"], ["city", "Public city / ZIP"],
      ["locationPrivate", "Private address / route"], ["amount", "Project amount", "number"],
      ["paymentStatus", "Payment status", "select", false, ["not-set", "deposit-due", "deposit-paid", "partially-paid", "paid", "refunded"]],
      ["deliverables", "Deliverables", "lines"], ["itinerary", "Itinerary", "textarea"], ["notes", "Internal notes", "textarea"],
    ],
    summary: (item) => `${item.customerName || "No customer"} · ${item.status || "No status"}`,
  },
  projects: {
    label: "Website Portfolio", endpoint: "/api/admin/projects", icon: FolderKanban,
    fields: [
      ["title", "Project title", "text", true], ["slug", "URL slug", "text", true],
      ["division", "Division", "select", true, ["digital", "creative", "property", "transportation"]],
      ["category", "Category"], ["summary", "Short summary", "textarea"], ["problem", "The problem", "textarea"], ["solution", "The solution", "textarea"],
      ["deliverables", "Deliverables — one per line", "lines"], ["features", "Features — one per line", "lines"],
      ["coverImage", "Cover image URL"], ["videoUrl", "YouTube or video URL"], ["websiteUrl", "Live website URL"], ["websiteLabel", "Website button label"],
      ["gallery", "Gallery — image URL | alt text, one per line", "gallery"], ["accent", "Accent color", "color"],
      ["sortOrder", "Sort order", "number"], ["featured", "Featured on homepage", "checkbox"], ["published", "Published", "checkbox"],
    ],
    summary: (item) => `${item.division || "Unassigned"} · ${item.published ? "Published" : "Draft"}`,
  },
};

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [active, setActive] = useState("overview");

  useEffect(() => {
    api("/api/auth/session").then((data) => setUser(data.user)).catch(() => {}).finally(() => setChecking(false));
  }, []);

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  if (checking) return <div className="admin-loading">Loading DFB Command Center…</div>;
  if (!user) return <AdminLogin onLogin={setUser} />;

  return (
    <div className="admin-shell">
      <Seo title="Admin" description="DFB Solutions private administration and customer management." noindex />
      <aside className="admin-sidebar">
        <div className="admin-brand"><strong>DFB.</strong><span>Command Center</span></div>
        <nav aria-label="Admin navigation">
          <button className={active === "overview" ? "active" : ""} onClick={() => setActive("overview")}><LayoutDashboard />Overview</button>
          {Object.entries(resources).map(([key, config]) => {
            const Icon = config.icon;
            return <button key={key} className={active === key ? "active" : ""} onClick={() => setActive(key)}><Icon />{config.label}</button>;
          })}
        </nav>
        <div className="admin-user"><span>{user.name}</span><small>{user.email}</small><button onClick={logout}><LogOut size={15} />Sign out</button></div>
      </aside>
      <main className="admin-main">
        {active === "overview" ? <Overview onNavigate={setActive} /> : <ResourcePanel key={active} resourceKey={active} config={resources[active]} />}
      </main>
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [setup, setSetup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", setupKey: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault(); setLoading(true); setStatus("");
    try {
      if (setup) {
        await api("/api/auth/bootstrap", { method: "POST", headers: { "X-Setup-Key": form.setupKey }, body: JSON.stringify(form) });
        setSetup(false); setStatus("Administrator created. Sign in, then remove ADMIN_SETUP_KEY from Vercel.");
      } else {
        const data = await api("/api/auth/login", { method: "POST", body: JSON.stringify(form) });
        onLogin(data.user);
      }
    } catch (error) { setStatus(error.message); } finally { setLoading(false); }
  }
  return <main className="admin-login">
    <Seo title="Admin Login" noindex />
    <form onSubmit={submit}>
      <div className="admin-brand"><strong>DFB.</strong><span>Command Center</span></div>
      <p className="eyebrow">{setup ? "First-time secure setup" : "Private administration"}</p>
      <h1>{setup ? "Create the owner account." : "Welcome back."}</h1>
      {setup && <AdminField field={["name", "Your name", "text", true]} value={form.name} onChange={(value) => setForm({ ...form, name: value })} />}
      <AdminField field={["email", "Email", "email", true]} value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
      <AdminField field={["password", "Password", "password", true]} value={form.password} onChange={(value) => setForm({ ...form, password: value })} />
      {setup && <AdminField field={["setupKey", "Setup key from environment", "password", true]} value={form.setupKey} onChange={(value) => setForm({ ...form, setupKey: value })} />}
      {status && <p className="admin-message" role="alert">{status}</p>}
      <button className="btn btn-primary" disabled={loading}>{loading ? "Working…" : setup ? "Create administrator" : "Sign in"}</button>
      <button className="admin-text-button" type="button" onClick={() => { setSetup(!setup); setStatus(""); }}>{setup ? "Return to sign in" : "First-time setup"}</button>
    </form>
  </main>;
}

function Overview({ onNavigate }) {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const load = useCallback(() => api("/api/admin/overview").then(setData).catch((error) => setMessage(error.message)), []);
  useEffect(() => { load(); }, [load]);
  async function seed() {
    try { const result = await api("/api/admin/seed", { method: "POST" }); setMessage(result.message); load(); } catch (error) { setMessage(error.message); }
  }
  const metricConfig = [
    ["newInquiries", "New inquiries", "inquiries"], ["customers", "Customer records", "customers"],
    ["upcomingBookings", "Next 30 days", "bookings"], ["publishedProjects", "Published projects", "projects"],
  ];
  return <div>
    <AdminHeader eyebrow="Business overview" title="Command Center" subtitle="The current state of inquiries, customers, bookings, and site content." />
    {message && <p className="admin-message">{message}</p>}
    <div className="metric-grid">{metricConfig.map(([key, label, target]) => <button key={key} onClick={() => onNavigate(target)}><span>{label}</span><strong>{data?.metrics?.[key] ?? "—"}</strong><small>Open records →</small></button>)}</div>
    <div className="admin-overview-grid">
      <section className="admin-panel"><div className="panel-title"><div><p className="eyebrow">Recent activity</p><h2>Latest inquiries</h2></div><button onClick={() => onNavigate("inquiries")}>View all</button></div>
        <div className="compact-list">{data?.recent?.length ? data.recent.map((item) => <button key={item._id} onClick={() => onNavigate("inquiries")}><span><strong>{item.name}</strong><small>{item.inquiryType} · {formatDate(item.createdAt)}</small></span><i>{item.status}</i></button>) : <p>No inquiries yet.</p>}</div>
      </section>
      <section className="admin-panel setup-panel"><Settings /><p className="eyebrow">Website content</p><h2>Import the current portfolio.</h2><p>This safely adds the approved projects to Atlas without overwriting records that already exist.</p><button className="btn btn-secondary" onClick={seed}>Import current projects</button></section>
    </div>
  </div>;
}

function ResourcePanel({ resourceKey, config }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api(`${config.endpoint}?search=${encodeURIComponent(search)}`);
      setItems(data.items || []);
    } catch (error) { setMessage(error.message); } finally { setLoading(false); }
  }, [config.endpoint, search]);
  useEffect(() => { const timer = setTimeout(load, 220); return () => clearTimeout(timer); }, [load]);

  async function remove(item) {
    if (!window.confirm(`Delete “${item.title || item.name}”? This cannot be undone.`)) return;
    try { await api(`${config.endpoint}?id=${item._id}`, { method: "DELETE" }); setMessage("Record deleted."); load(); } catch (error) { setMessage(error.message); }
  }

  return <div>
    <AdminHeader eyebrow="Manage records" title={config.label} subtitle={resourceKey === "projects" ? "Changes published here power the public portfolio." : "Search, update status, add notes, and keep the work moving."} />
    <div className="admin-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${config.label.toLowerCase()}…`} /></label><button className="btn btn-primary" onClick={() => setEditing({})}>Add record</button></div>
    {message && <p className="admin-message">{message}</p>}
    <div className="record-list">
      {loading ? <p>Loading records…</p> : items.length ? items.map((item) => <article key={item._id}>
        {resourceKey === "projects" && item.coverImage && <img src={item.coverImage} alt="" />}
        <div><span>{item.status || item.category || item.division || "Record"}</span><h2>{item.title || item.name}</h2><p>{config.summary(item)}</p><small>Updated {formatDate(item.updatedAt || item.createdAt)}</small></div>
        <div className="record-actions"><button onClick={() => setEditing(item)}>Edit</button><button className="danger" onClick={() => remove(item)}>Delete</button></div>
      </article>) : <div className="admin-empty"><h2>No records found.</h2><p>Create the first one or change your search.</p></div>}
    </div>
    {editing && <RecordEditor config={config} item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setMessage("Record saved."); load(); }} />}
  </div>;
}

function RecordEditor({ config, item, onClose, onSaved }) {
  const initial = useMemo(() => toFormValues(item, config.fields), [item, config.fields]);
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const body = fromFormValues(form, config.fields);
      await api(`${config.endpoint}${item._id ? `?id=${item._id}` : ""}`, { method: item._id ? "PUT" : "POST", body: JSON.stringify(body) });
      onSaved();
    } catch (error) { setMessage(error.message); } finally { setSaving(false); }
  }
  return <div className="editor-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="record-editor" role="dialog" aria-modal="true" aria-label={`Edit ${config.label}`}>
      <header><div><p className="eyebrow">{item._id ? "Update record" : "New record"}</p><h2>{item.title || item.name || config.label}</h2></div><button aria-label="Close editor" onClick={onClose}><X /></button></header>
      <form onSubmit={submit}><div className="editor-fields">{config.fields.map((field) => <AdminField key={field[0]} field={field} value={form[field[0]]} onChange={(value) => setForm({ ...form, [field[0]]: value })} />)}</div>
        {item.details && <details className="submitted-details"><summary>Original submitted details</summary><pre>{JSON.stringify(item.details, null, 2)}</pre></details>}
        {message && <p className="admin-message" role="alert">{message}</p>}
        <footer><button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save record"}</button></footer>
      </form>
    </section>
  </div>;
}

function AdminField({ field, value, onChange }) {
  const [name, label, type = "text", required = false, options = []] = field;
  if (type === "checkbox") return <label className="admin-checkbox"><input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>;
  return <label className={["textarea", "lines", "gallery", "pairs"].includes(type) ? "wide" : ""}><span>{label}{required && <i>Required</i>}</span>
    {type === "textarea" || type === "lines" || type === "gallery" || type === "pairs" ? <textarea rows={type === "textarea" ? 5 : 4} value={value || ""} required={required} onChange={(event) => onChange(event.target.value)} /> :
      type === "select" ? <select value={value || ""} required={required} onChange={(event) => onChange(event.target.value)}><option value="">Select one</option>{options.map((option) => <option key={option}>{option}</option>)}</select> :
      <input type={type} value={value ?? ""} required={required} onChange={(event) => onChange(event.target.value)} />}
  </label>;
}

function AdminHeader({ eyebrow, title, subtitle }) {
  return <header className="admin-page-header"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{subtitle}</p></header>;
}

function toFormValues(item, fields) {
  const output = {};
  for (const [name,, type] of fields) {
    const value = item[name];
    if (type === "lines") output[name] = Array.isArray(value) ? value.join("\n") : "";
    else if (type === "gallery") output[name] = Array.isArray(value) ? value.map((entry) => `${entry.src || ""} | ${entry.alt || ""}`).join("\n") : "";
    else if (type === "pairs") output[name] = Array.isArray(value) ? value.map((entry) => `${entry[0] || ""} | ${entry[1] || ""}`).join("\n") : "";
    else if (type === "datetime-local") output[name] = value ? new Date(value).toISOString().slice(0, 16) : "";
    else if (type === "checkbox") output[name] = Boolean(value);
    else output[name] = value ?? "";
  }
  return output;
}

function fromFormValues(form, fields) {
  const output = {};
  for (const [name,, type] of fields) {
    const value = form[name];
    if (type === "lines") output[name] = String(value || "").split("\n").map((line) => line.trim()).filter(Boolean);
    else if (type === "gallery") output[name] = String(value || "").split("\n").map((line) => { const [src, ...alt] = line.split("|"); return { src: src.trim(), alt: alt.join("|").trim() }; }).filter((entry) => entry.src);
    else if (type === "pairs") output[name] = String(value || "").split("\n").map((line) => { const [first, ...second] = line.split("|"); return [first.trim(), second.join("|").trim()]; }).filter(([first, second]) => first && second);
    else output[name] = value;
  }
  return output;
}

async function api(url, options = {}) {
  const response = await fetch(url, { credentials: "same-origin", headers: { "Content-Type": "application/json", ...options.headers }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) throw new Error(data.message || "The request could not be completed.");
  return data;
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
