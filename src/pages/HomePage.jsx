import { ArrowRight, Camera, Check, Code2, Film, Palette, Route, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard.jsx";
import Seo from "../components/Seo.jsx";
import SolutionFinder from "../components/SolutionFinder.jsx";
import { useContent } from "../context/ContentContext.jsx";
import { useProjects } from "../context/ProjectsContext.jsx";

const serviceIcons = { photography: Camera, videography: Film, websites: Code2, branding: Palette };
const defaultFeatured = ["photography", "videography", "websites", "branding"];

export default function HomePage() {
  const { projects } = useProjects();
  const { siteContent, services } = useContent();
  const home = siteContent.home;
  const featuredServices = (home.featuredServiceSlugs || defaultFeatured).map((slug) => services.find((service) => service.slug === slug)).filter(Boolean).slice(0, 4);
  return <><Seo title="Photo · Video · Digital" description={home.intro} image={home.heroMedia?.src} /><main id="top">
    <section className="hero home-service-hero section">
      <div className="hero-copy"><p className="eyebrow">{home.eyebrow}</p><h1>{home.headline}</h1><p className="hero-intro">{home.intro}</p><p className="brand-promise">Every Problem Has a Solution.</p><div className="hero-actions"><Link className="btn btn-primary" to={home.primaryCtaLink}>{home.primaryCtaLabel} <ArrowRight size={17} /></Link><Link className="btn btn-secondary" to={home.secondaryCtaLink}>{home.secondaryCtaLabel}</Link><Link className="text-link" to="/work">View our work <ArrowRight size={16} /></Link></div></div>
      <div className="home-hero-media">{home.heroMedia?.src ? (home.heroMedia.type === "video" ? <video src={home.heroMedia.src} poster={home.heroMedia.poster} muted autoPlay loop playsInline preload="metadata" /> : <img src={home.heroMedia.src} alt={home.heroMedia.alt || ""} style={{ objectPosition: `${home.heroMedia.focalPoint?.x ?? 50}% ${home.heroMedia.focalPoint?.y ?? 50}%` }} />) : <div className="creative-signal" aria-label="DFB Photo Video Digital"><span>PHOTO</span><span>VIDEO</span><span>DIGITAL</span><i>DFB.</i><small>Hero media is editable in Admin</small></div>}</div>
    </section>
    <section className="section primary-service-section"><div className="section-heading"><div><p className="eyebrow">Choose what you need</p><h2>Start with the service you recognize.</h2></div><p>Clear paths for visual coverage, content, design, and digital products.</p></div><div className="primary-service-grid">{featuredServices.map((service) => { const Icon = serviceIcons[service.slug] || Code2; return <Link to={"/" + service.slug} key={service.slug} style={{ "--accent": service.accent }}><Icon /><h3>{service.name}</h3><p>{service.intro}</p><span>Explore <ArrowRight size={16} /></span></Link>; })}</div></section>
    <section className="section featured-section"><div className="section-heading"><div><p className="eyebrow">Selected work</p><h2>See what DFB delivers.</h2></div><Link className="text-link" to="/work">Explore all work <ArrowRight size={16} /></Link></div><div className="project-grid">{projects.filter((project) => project.featured).slice(0, 3).map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}</div></section>
    <section className="section process-section"><div className="process-intro"><p className="eyebrow">How it works</p><h2>A professional path from idea to delivery.</h2><p>{siteContent.global.processIntro}</p></div><ol className="process-list">{[["Choose", "Select the exact service or tell us when you are unsure."], ["Share", "Provide the date, scope, priorities, and useful references."], ["Plan", "DFB reviews availability and prepares the right path and quote."], ["Create", "The confirmed work moves through a clear production or build process."], ["Deliver", "Receive the finished media, design, product, or coordinated solution."]].map(([title, copy], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol></section>
    <section className="section standards-section"><div><p className="eyebrow">Professional by design</p><h2>Clarity is part of the deliverable.</h2><p>{siteContent.global.trustCopy}</p></div><div className="standards-list">{["Clear communication", "Custom planning", "Professional execution", "Secure private galleries", "Reliable handoff"].map((item) => <span key={item}><Check size={16} /> {item}</span>)}</div></section>
    <section className="section additional-solutions"><div><p className="eyebrow">{home.additionalHeading}</p><h2>Additional Solutions</h2><p>{home.additionalCopy}</p></div><div><Link to="/solutions/transportation"><Route /><span><strong>Transportation</strong><small>Private groups, events, weddings, concerts, trips, and multi-stop coordination.</small></span><ArrowRight /></Link><Link to="/solutions/property"><Wrench /><span><strong>Property</strong><small>Contained repairs, assembly, installation, platforms, and practical improvements.</small></span><ArrowRight /></Link></div></section>
    <section className="section finder-section" id="find-solution"><SolutionFinder /></section>
    <section className="section final-cta"><p className="eyebrow">Your next step</p><h2>Choose the service.<br /><em>Tell us what matters.</em></h2><p>An inquiry checks fit, availability, and scope. It does not confirm a booking.</p><div><Link className="btn btn-primary" to="/contact">Book / Get a Quote <ArrowRight size={17} /></Link><Link className="btn btn-secondary" to="/gallery">Client Gallery</Link></div></section>
  </main></>;
}
