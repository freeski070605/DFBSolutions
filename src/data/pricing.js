import { pricingSections, photoVideoAddOns } from "./photoVideoPricing.js";

const source = Object.fromEntries(pricingSections.map((section) => [section.id, section]));
const packaged = (packageItem, featured = false) => ({
  name: packageItem.name,
  description: packageItem.description || "Coverage tailored to the occasion and the moments that matter.",
  price: packageItem.price,
  priceLabel: "Starting at",
  priceSuffix: packageItem.plus ? "+" : "",
  features: packageItem.features.slice(0, 6).map((feature) => feature.replaceAll("â€“", "–")),
  service: packageItem.service,
  subtype: packageItem.subtype,
  featured,
});
const custom = (name, description, features, service, subtype) => ({ name, description, priceLabel: "Custom Quote", customQuote: true, features, service, subtype });

export const pricingCategories = [
  {
    slug: "photo-video", title: "Photography & Video", navTitle: "Photo & Video", icon: "camera",
    description: "Portraits, events, milestone moments, and films.",
    groups: [
      { title: "Photography", packages: source.photography.packages.map((item) => packaged(item)) },
      { title: "Event Video", packages: source.video.packages.map((item) => packaged(item)) },
      { title: "Photo + Video", packages: source["photo-video"].packages.map((item) => packaged(item, item.name === "DFB Event Experience")) },
      { title: "Prom & Graduation", packages: [custom("Prom & Graduation Coverage", "Photos, video, or both for a milestone worth remembering.", ["Coverage planned around your schedule", "Portraits and candid moments", "Edited digital delivery"], "photography", "Prom")] },
    ],
    initialCount: 4,
  },
  {
    slug: "weddings", title: "Wedding Packages", navTitle: "Weddings", icon: "heart",
    description: "Thoughtful photo and film coverage for your day.",
    groups: source.weddings.groups.map((group) => ({ title: group.title, packages: group.packages.map((item) => packaged(item, item.name === "Full Wedding Story")) })),
  },
  {
    slug: "music-sports", title: "Music & Sports Media", navTitle: "Music & Sports", icon: "play",
    description: "Visuals for artists, athletes, and teams.",
    groups: [
      { title: "Music Videos", packages: source["music-videos"].packages.map((item) => packaged(item)) },
      { title: "Sports Media", packages: [custom("Sports Media", "Action photography and highlight content for athletes or teams.", ["Coverage and access planning", "Action or portrait capture", "Edited media for your goals"], "photography", "Sports / Athlete")] },
    ],
  },
  {
    slug: "business-content", title: "Business Content", navTitle: "Business Content", icon: "briefcase",
    description: "Campaigns, recurring content, editing, and design.",
    groups: [
      { title: "Business & Commercial Content", packages: [packaged(source.business.packages[0]), { ...custom("Business Promo Video", "A focused video that clearly presents your offer or story.", ["Goal and audience planning", "Production scope", "Edited delivery for your channels"], "content", "Promotional Content"), featured: true }, custom("Commercial Production", "A larger production built around your campaign requirements.", ["Creative and production planning", "Crew and location scope", "Delivery formats agreed in advance"], "videography", "Promotional / Commercial")] },
      { title: "Content Creation", packages: [{ ...custom("Growth Content", "Recurring photos and short videos for a consistent presence.", ["Content planning", "Repeatable production schedule", "Platform-ready assets"], "content", "Social Content Package"), featured: true }] },
      { title: "Video Editing", packages: [custom("Video Editing", "Turn existing footage into polished, useful content.", ["Footage review", "Editing and color", "Final formats for your channels"], "videography", "Other Video")] },
      { title: "Graphics & Digital Media", packages: [custom("Graphics & Digital Media", "Branded visuals for campaigns, events, and social channels.", ["Creative direction", "Design and refinement", "Ready-to-use files"], "branding", "Multiple Items")] },
    ],
    initialCount: 3,
  },
  {
    slug: "digital-ai", title: "Digital & AI Solutions", navTitle: "Digital & AI", icon: "code",
    description: "Websites, apps, and useful automation.",
    groups: [
      { title: "Websites", packages: [{ ...custom("Business Website", "A responsive website that helps customers understand and act.", ["Discovery and page structure", "Responsive design and development", "Launch support"], "website", "New Website"), featured: true }, custom("Large or Custom Website", "A broader website with custom features or integrations.", ["Experience and content planning", "Custom functionality", "Testing and launch"], "website", "Other Website")] },
      { title: "App Development", packages: [custom("App Development", "A digital tool built around your users and workflow.", ["Product discovery", "Interface and feature planning", "Development and testing"], "app", "New App")] },
      { title: "AI & Automation", packages: [custom("AI & Automation", "Practical systems that reduce repetitive work.", ["Workflow review", "Solution design", "Integration and handoff"], "app", "Automation")] },
    ],
  },
  {
    slug: "transportation", title: "Transportation", navTitle: "Transportation", icon: "route",
    description: "Group trips, events, and planned itineraries.",
    groups: [{ title: "Trip Options", packages: [
      custom("Local Transportation", "Point-to-point travel planned for your group.", ["Pickup and destination review", "Passenger and timing planning", "Clear trip details"], "transportation", "Private Group"),
      custom("Event Transportation", "Coordinated travel for weddings, proms, and events.", ["Event schedule review", "Pickup and drop-off planning", "Group coordination"], "transportation", "Event Transportation"),
      custom("Regional & Multi-Day Trips", "Longer or multi-stop itineraries scoped around your plans.", ["Route and stop planning", "Duration and passenger review", "Custom itinerary quote"], "transportation", "Multi-stop Itinerary"),
    ] }],
  },
  {
    slug: "home-property", title: "Home & Property Services", navTitle: "Home & Property", icon: "hammer",
    description: "Focused repairs and practical improvements.",
    groups: [{ title: "Property Work", packages: [
      custom("Drywall Repair", "Contained repairs assessed by size and condition.", ["Issue and photo review", "Repair scope", "Finish plan"], "property", "Drywall Repair"),
      custom("Painting", "Painting for a clearly scoped space or project.", ["Surface review", "Preparation plan", "Materials and finish scope"], "property", "Small Improvement"),
      custom("Decks & Outdoor Projects", "Useful outdoor improvements planned around your space.", ["Site and scope review", "Materials planning", "Project schedule"], "property", "Deck Platform"),
      custom("General Property Services", "Assembly, installation, and other contained improvements.", ["Project review", "Practical scope", "Clear estimate"], "property", "Contained Custom Project"),
    ] }],
  },
];

export const pricingAddOns = photoVideoAddOns.filter(([name]) => ["Additional photography hour", "Additional video hour", "Additional photo + video hour", "Additional social-media reel", "Rush turnaround", "Second photographer/videographer", "Travel outside standard service area"].includes(name));
