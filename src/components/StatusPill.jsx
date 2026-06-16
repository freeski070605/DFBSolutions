export default function StatusPill({ children, tone = "blue" }) {
  const tones = {
    blue: "border-voltage/40 bg-voltage/10 text-sky-100",
    green: "border-signal/40 bg-signal/10 text-emerald-100",
    heat: "border-heat/40 bg-heat/10 text-amber-100",
    chrome: "border-white/20 bg-white/10 text-slate-100",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] ${tones[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_12px_currentColor]" />
      {children}
    </span>
  );
}
