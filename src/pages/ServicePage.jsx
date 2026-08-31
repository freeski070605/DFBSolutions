import { ArrowRight, Check, Clock3, Images, LockKeyhole } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import FaqList from "../components/FaqList.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import Seo from "../components/Seo.jsx";
import { useContent } from "../context/ContentContext.jsx";
import { useProjects } from "../context/ProjectsContext.jsx";

export default function ServicePage({ slug: routeSlug }) {
  const params = useParams();
  const slug = routeSlug || params.slug;
  const { services, testimonials } = useContent();
  const { projects } = useProjects();
  const service = services.find((item) => item.slug === slug && item.active !== false);
  if (!service) return <Navigate to="/404" replace />;
  const related = projects.filter((project) => service.featuredProjectSlugs?.includes(project.slug) || project.serviceSlug === slug || project.category?.toLowerCase().includes(service.name.toLowerCase().split(" ")[0])).slice(0, 3);
  const quotes = testimonials.filter((item) => item.public && (!item.serviceSlugs?.length || item.serviceSlugs.includes(slug))).slice(0, 3);
  const contact = `/contact?service=${encodeURIComponent(service.ctaService || slug)}${service.ctaSubtype ? `&subtype=${encodeURIComponent(service.ctaSubtype)}` : ""}`;
  return <main id="top" className="service-page" style={{ "--page-accent": service.accent || "#cfff45" }}>
    <Seo title={service.seoTitle || service.name} description={service.seoDescription || service.intro} image={service.seoImage || service.heroMedia?.src} />
    <section className={`service-hero section ${service.heroMedia?.src ? "has-media" : ""}`}>
      <div className="service-hero-copy"><p className="eyebrow">{service.eyebrow}</p><h1>{service.headline}</h1><p>{service.intro}</p><div className="hero-actions"><Link className="btn btn-primary" to={contact}>{service.ctaLabel || "Request a quote"} <ArrowRight size={17} /></Link><Link className="btn btn-secondary" to="/work">See relevant work</Link></div></div>
      <div className="service-hero-media">{service.heroMedia?.src ? (service.heroMedia.type === "video" ? <video src={service.heroMedia.src} controls preload="metadata" poster={service.heroMedia.poster} /> : <img src={service.heroMedia.src} alt={service.heroMedia.alt || ""} />) : <div className="media-placeholder"><span>DFB / {service.name}</span><strong>{service.name}</strong><small>Hero media can be added or replaced in Admin.</small></div>}</div>
    </section>
    <section className="section service-offerings"><div><p className="eyebrow">What we create</p><h2>Coverage and deliverables shaped around the real need.</h2></div><div className="service-item-grid">{service.serviceItems?.map((item) => <article key={item}><span>+</span><h3>{item}</h3></article>)}</div></section>
    <section className="section service-included"><div><p className="eyebrow">Built into the experience</p><h2>Professional from planning through delivery.</h2></div><ul>{service.included?.map((item) => <li key={item}><Check size={17} />{item}</li>)}</ul></section>
    {service.gallery?.length > 0 && <section className="section media-gallery"><div className="section-heading"><div><p className="eyebrow">Selected work</p><h2>See the details.</h2></div></div><div className="gallery-grid">{service.gallery.map((media, index) => <img key={`${media.src}-${index}`} src={media.src} alt={media.alt || `${service.name} work ${index + 1}`} loading="lazy" />)}</div></section>}
    <section className="section process-section"><div className="process-intro"><p className="eyebrow">The process</p><h2>Clear steps.<br />Room for the work.</h2><p>{service.turnaround}</p></div><ol className="process-list">{service.process?.map(([title, copy], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol></section>
    <section className="section guidance-grid"><article><Clock3 /><p className="eyebrow">Pricing guidance</p><h2>{service.pricing?.visible !== false ? service.pricing?.label : "Custom quote"}</h2><p>{service.pricing?.visible !== false ? service.pricing?.text : "Your quote is based on the specific scope and deliverables."}</p></article><article><LockKeyhole /><p className="eyebrow">A date is not booked by an inquiry</p><h2>Availability first. Agreement next.</h2><p>DFB reviews the service, date, and scope. Where applicable, a signed agreement and deposit secure the booking.</p></article><article><Images /><p className="eyebrow">Private delivery</p><h2>Client Gallery</h2><p>Eligible photography work can be delivered through a protected DFB client gallery. Private event media is never exposed in this public portfolio.</p></article></section>
    {related.length > 0 && <section className="section featured-section"><div className="section-heading"><div><p className="eyebrow">Relevant work</p><h2>Proof in the work.</h2></div></div><div className="project-grid">{related.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}</div></section>}
    {quotes.length > 0 && <section className="section testimonial-grid">{quotes.map((quote) => <blockquote key={quote.clientName + quote.quote}><p>“{quote.quote}”</p><footer>{quote.clientName}<small>{quote.businessEvent || quote.serviceType}</small></footer></blockquote>)}</section>}
    {service.faqs?.length > 0 && <section className="section faq-section"><div><p className="eyebrow">Good to know</p><h2>Frequently asked questions.</h2></div><FaqList items={service.faqs} /></section>}
    <section className="section mini-cta"><div><p className="eyebrow">Ready when you are</p><h2>Tell us what you are planning.</h2></div><Link className="btn btn-primary" to={contact}>{service.ctaLabel || "Request a quote"} <ArrowRight size={17} /></Link></section>
    <Link className="mobile-sticky-cta" to={contact}>{service.ctaLabel || "Request a quote"} <ArrowRight size={16} /></Link>
  </main>;
}
