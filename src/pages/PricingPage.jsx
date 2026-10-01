import { ArrowRight, BriefcaseBusiness, Camera, Check, ChevronDown, Code2, Hammer, Heart, Play, Route } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { pricingAddOns, pricingCategories } from "../data/pricing.js";

const icons = { camera: Camera, heart: Heart, play: Play, briefcase: BriefcaseBusiness, code: Code2, route: Route, hammer: Hammer };
const preferred = ["Essential Photo", "Event Photo", "DFB Event Experience", "DFB Full Experience"];

function contactHref(item) {
  const query = new URLSearchParams({ service: item.service, subtype: item.subtype });
  return `/contact?${query.toString()}`;
}

function PricingCategoryNav({ onSelect }) {
  return <nav className="pricing-nav section" aria-label="Pricing categories" id="services">
    <div className="pricing-section-lead"><p className="eyebrow">Explore services</p><h2>Find your starting point.</h2><p>Choose a category to see packages and the best next step.</p></div>
    <div className="pricing-nav-list">{pricingCategories.map((category) => { const Icon = icons[category.icon]; return <a key={category.slug} href={`#${category.slug}`} onClick={(event) => { event.preventDefault(); onSelect(category.slug); window.history.replaceState(null, "", `#${category.slug}`); document.getElementById(category.slug)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }); }}><Icon aria-hidden="true" size={25} /><strong>{category.navTitle}</strong><span>{category.description}</span><ArrowRight aria-hidden="true" size={17} /></a>; })}</div>
  </nav>;
}

function PricingBadge() { return <span className="pricing-badge">Most Popular</span>; }

function PricingCard({ item }) {
  return <article className={`pricing-card${item.featured ? " is-featured" : ""}`}>
    <div className="pricing-card-top">{item.featured && <PricingBadge />}<span className="pricing-card-group">{item.groupTitle}</span><h3>{item.name}</h3><p>{item.description}</p></div>
    <p className="pricing-card-price">{item.customQuote ? "Custom Quote" : <><small>{item.priceLabel}</small><strong>{item.price}{item.priceSuffix}</strong></>}</p>
    <ul>{item.features.map((feature) => <li key={feature}><Check size={16} aria-hidden="true" />{feature}</li>)}</ul>
    <Link className={`btn ${item.featured ? "btn-primary" : "btn-secondary"}`} to={contactHref(item)}>{item.customQuote ? "Request a Quote" : "Book This Package"} <ArrowRight size={16} aria-hidden="true" /></Link>
  </article>;
}

function PricingSection({ category, expanded, onToggle }) {
  const [showMore, setShowMore] = useState(false);
  const all = category.groups.flatMap((group) => group.packages.map((item) => ({ ...item, groupTitle: group.title })));
  const ordered = category.slug === "photo-video" ? [...all].sort((a, b) => {
    const aIndex = preferred.indexOf(a.name), bIndex = preferred.indexOf(b.name);
    return (aIndex < 0 ? 100 : aIndex) - (bIndex < 0 ? 100 : bIndex);
  }) : all;
  const visible = showMore || !category.initialCount ? ordered : ordered.slice(0, category.initialCount);
  const Icon = icons[category.icon];
  return <section className="pricing-category section" id={category.slug} aria-labelledby={`${category.slug}-title`}>
    <div className="pricing-category-heading"><Icon size={27} aria-hidden="true" /><div><h2 id={`${category.slug}-title`}>{category.title}</h2><p>{category.description}</p></div><button type="button" aria-expanded={expanded} aria-controls={`${category.slug}-content`} onClick={onToggle}><span>{expanded ? "Hide packages" : "View packages"}</span><ChevronDown className={expanded ? "rotated" : ""} size={22} aria-hidden="true" /></button></div>
    <div className="pricing-category-content" id={`${category.slug}-content`} hidden={!expanded}><p className="pricing-inquiry-note">Starting prices are guides. Final scope, availability, and booking terms are confirmed after your inquiry.</p><div className="pricing-card-grid">{visible.map((item) => <PricingCard key={item.name} item={item} />)}</div>{category.initialCount && ordered.length > category.initialCount && <button className="pricing-more" type="button" aria-expanded={showMore} onClick={() => setShowMore(!showMore)}>{showMore ? "Show Fewer Options" : `View More ${category.navTitle} Options`} <ChevronDown className={showMore ? "rotated" : ""} size={18} aria-hidden="true" /></button>}</div>
  </section>;
}

function PricingAddons() { return <section className="pricing-addons section" aria-labelledby="addons-title"><div className="pricing-section-lead"><p className="eyebrow">Make it yours</p><h2 id="addons-title">Popular Add-Ons</h2><p>Available with eligible photo and video packages. Confirm availability and scope when you inquire.</p></div><ul>{pricingAddOns.map(([name, price]) => <li key={name}><span>{name}</span><strong>{price}</strong></li>)}</ul></section>; }

function BookingSteps() { return <section className="pricing-booking section" aria-labelledby="booking-title"><div className="pricing-section-lead"><p className="eyebrow">Simple from the start</p><h2 id="booking-title">How Booking Works</h2></div><ol>{[["Choose Your Service", "Select a package or request a custom quote."], ["Tell Us About Your Project", "Share your date, location, needs, and deadline."], ["Secure Your Booking", "After scope and availability are confirmed, an agreement and required deposit secure the work."], ["We Handle the Rest", "DFB completes and delivers the project to the agreed scope."]].map(([title, copy], index) => <li key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol></section>; }

function CustomQuoteCTA() { return <section className="pricing-custom section" aria-labelledby="custom-title"><p className="eyebrow">Built around your needs</p><h2 id="custom-title">Don’t See Exactly What You Need?</h2><p>DFB Solutions is built around solving problems, not forcing every project into a preset package. Tell us what you need and we’ll build the right solution.</p><div><Link className="btn btn-primary" to="/contact?service=unsure">Request a Custom Quote <ArrowRight size={17} /></Link><Link className="btn btn-secondary" to="/contact">Contact DFB</Link></div></section>; }

export default function PricingPage() {
  const [openCategory, setOpenCategory] = useState(() => pricingCategories.some((item) => `#${item.slug}` === window.location.hash) ? window.location.hash.slice(1) : "photo-video");
  return <main className="pricing-page" id="top"><Seo title="Pricing" description="Explore DFB Solutions pricing for photography, video, weddings, business content, digital services, transportation, and property work." />
    <section className="pricing-hero section"><div><p className="eyebrow">Explore DFB Solutions</p><h1><span className="pricing-sr-only">DFB Solutions Pricing: </span>Solutions for<br /><em>Every Project.</em></h1><p>From photography and video to business solutions, transportation, digital services and property work, DFB Solutions offers flexible packages built around what you need.</p><div className="pricing-hero-actions"><a className="btn btn-primary" href="#services">View Services <ArrowRight size={17} /></a><Link className="btn btn-secondary" to="/contact?service=unsure">Request a Custom Quote</Link></div></div><div className="pricing-hero-aside"><span>DFB.</span><p>For Every Problem,<br />We Have the Solution.</p><small>Photo · Video · Digital · More</small></div></section>
    <PricingCategoryNav onSelect={setOpenCategory} />
    <div className="pricing-categories" aria-label="Service packages">{pricingCategories.map((category) => <PricingSection key={category.slug} category={category} expanded={openCategory === category.slug} onToggle={() => setOpenCategory(openCategory === category.slug ? "" : category.slug)} />)}</div>
    <PricingAddons /><BookingSteps /><CustomQuoteCTA />
    <Link className="pricing-mobile-cta" to="/contact?service=unsure">Request a Quote <ArrowRight size={17} aria-hidden="true" /></Link>
  </main>;
}
