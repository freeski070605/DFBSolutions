import { services } from "../data/services.js";
import SectionHeader from "./SectionHeader.jsx";
import ServiceCard from "./ServiceCard.jsx";

export default function ServicesCommandCenter() {
  return (
    <section id="services" className="section-shell relative">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-none border-y border-white/10 bg-black/20 py-5">
          <div className="grid gap-3 px-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400 sm:grid-cols-3">
            <span>Service Selector</span>
            <span className="text-signal">Custom Assets</span>
            <span className="sm:text-right">Built From Scratch</span>
          </div>
        </div>
        <div className="mt-12">
          <SectionHeader
            eyebrow="Work With Us"
            title="Creative Services Without The Cookie-Cutter Feel."
          />
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => (
              <ServiceCard key={service.title} service={service} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
