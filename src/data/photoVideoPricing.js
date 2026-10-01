export const pricingSections = [
  {
    id: "photography",
    title: "Photography",
    intro: "From portraits to the moments everyone came to celebrate.",
    packages: [
      { name: "Essential Photo", price: "$450", description: "Perfect for smaller events, portraits and celebrations.", features: ["Up to 2 hours of coverage", "Professionally edited photos", "Private digital gallery", "High-resolution downloads"], service: "photography", subtype: "Portrait Session" },
      { name: "Event Photo", price: "$550", description: "More coverage for birthdays, graduations, baby showers, parties and special events.", features: ["Up to 3 hours of coverage", "Professionally edited gallery", "High-resolution digital delivery", "Key portraits and candid moments"], service: "photography", subtype: "Birthday / Event" },
      { name: "Extended Event Photo", price: "$650", description: "For events where you want the full story captured.", features: ["Up to 4 hours of coverage", "Full professionally edited gallery", "Portraits, details and candid coverage", "High-resolution downloads"], service: "photography", subtype: "Birthday / Event" },
    ],
  },
  {
    id: "video",
    title: "Video",
    intro: "Moving images made to be watched, shared and remembered.",
    packages: [
      { name: "Social Video", price: "$450", description: "Short-form content designed for social media.", features: ["Up to 2 hours of filming", "30–60 second edited video", "Professional color and editing", "Vertical social-media delivery"], service: "videography", subtype: "Social Media Content" },
      { name: "Event Highlight Film", price: "$750", description: "Turn your event into a cinematic recap.", features: ["Up to 3 hours of coverage", "1–3 minute highlight video", "Professional editing and color", "Music-driven cinematic presentation"], service: "videography", subtype: "Event Recap" },
    ],
  },
  {
    id: "photo-video",
    title: "Photo + Video",
    intro: "One event, covered in stills and motion.",
    packages: [
      { name: "DFB Event Experience", price: "$850", description: "Get professional photos and a highlight video from the same event.", features: ["Up to 3 hours of coverage", "Professionally edited photo gallery", "30–60 second highlight video", "Digital delivery"], service: "photo-video", subtype: "Birthday / Event" },
      { name: "DFB Full Experience", price: "$1,200", description: "Our complete event coverage package.", features: ["Up to 4 hours of photo + video coverage", "Full edited photo gallery", "1–3 minute cinematic highlight film", "30–60 second social-media edit", "High-resolution digital delivery"], service: "photo-video", subtype: "Birthday / Event" },
    ],
  },
  {
    id: "weddings",
    title: "Weddings",
    intro: "Coverage for the day you will want to return to.",
    groups: [
      { title: "Wedding Photography", packages: [
        { name: "Intimate Wedding", price: "$900", features: ["Up to 3 hours of coverage", "Ceremony coverage", "Couple and family portraits", "Reception highlights", "Professionally edited gallery"], service: "photography", subtype: "Wedding" },
        { name: "Wedding Story", price: "$1,250", features: ["Up to 5 hours of coverage", "Ceremony, portraits and reception", "Detail and candid photography", "Full professionally edited gallery"], service: "photography", subtype: "Wedding" },
      ] },
      { title: "Wedding Photo + Video", packages: [
        { name: "DFB Wedding Experience", price: "$1,500", features: ["Up to 4 hours of coverage", "Professional photography", "Edited photo gallery", "Cinematic wedding highlight", "Social-media teaser"], service: "photo-video", subtype: "Wedding" },
        { name: "Full Wedding Story", price: "$2,000", plus: true, description: "For couples who want more complete coverage of their day.", features: ["Extended photo + video coverage", "Full edited photo gallery", "Cinematic wedding film", "Ceremony and reception highlights", "Social-media teaser", "Custom coverage options"], service: "photo-video", subtype: "Wedding" },
      ] },
    ],
  },
  {
    id: "music-videos",
    title: "Music Videos",
    intro: "Visuals shaped around the track and your creative direction.",
    packages: [
      { name: "Performance Video", price: "$600", plus: true, description: "Ideal for straightforward performance-based visuals.", features: ["Pre-shoot planning", "Professional filming", "Editing and color", "Final music video"], service: "videography", subtype: "Music Video" },
      { name: "Concept Music Video", price: "$1,000", plus: true, description: "For more creative productions involving multiple scenes, locations or concepts.", features: ["Creative development", "Pre-production planning", "Professional filming", "Advanced editing", "Color treatment", "Visual effects as needed"], service: "videography", subtype: "Music Video" },
    ],
  },
  {
    id: "business",
    title: "Business & Commercial Content",
    intro: "Professional content for brands, businesses, organizations and entrepreneurs.",
    packages: [
      { name: "Business Content Session", price: "$750", plus: true, description: "Ideal for promotional videos, social-media campaigns, interviews, business events, product or service content, and brand storytelling.", features: ["Promotional videos", "Social-media campaigns", "Interviews", "Business events", "Product/service content", "Brand storytelling"], featuresLabel: "Ideal for", service: "content", subtype: "Promotional Content" },
    ],
    note: "Custom commercial projects are quoted based on production requirements.",
  },
];

export const pricingPackages = pricingSections.flatMap((section) => section.groups ? section.groups.flatMap((group) => group.packages) : section.packages);

export const photoVideoAddOns = [
  ["Additional photography hour", "$150"],
  ["Additional video hour", "$200"],
  ["Additional photo + video hour", "$250"],
  ["Additional social-media reel", "$100"],
  ["30–60 second social edit", "$150"],
  ["Raw video footage", "$250+"],
  ["Same-day teaser", "$250"],
  ["Rush turnaround", "$200+"],
  ["Second photographer/videographer", "$350+"],
  ["Travel outside standard service area", "Custom quote"],
];
