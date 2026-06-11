export default function StatusPill(label, tone = 'green') {
  return `<span class="status-pill ${tone}"><span></span>${label}</span>`;
}
