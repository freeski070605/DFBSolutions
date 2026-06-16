import {
  Bot,
  Camera,
  Film,
  Globe2,
  Layers3,
  PenTool,
} from "lucide-react";

export const services = [
  {
    title: "Photography & Visual Media",
    icon: Camera,
    description:
      "Moments, faces, products, and brand stories captured with direction and polish.",
    items: [
      "Wedding photography",
      "Event photography",
      "Portraits",
      "Brand shoots",
      "Promo visuals",
      "Product/lifestyle visuals",
    ],
  },
  {
    title: "Brand & Business Assets",
    icon: PenTool,
    description:
      "Launch-ready visuals and identity pieces shaped for real businesses and creators.",
    items: [
      "Logos",
      "Flyers",
      "Business bios",
      "Social media graphics",
      "Brand kits",
      "Launch visuals",
    ],
  },
  {
    title: "Content Systems",
    icon: Film,
    description:
      "Posting-ready content engines built around hooks, rhythm, and repeatable output.",
    items: [
      "7-day short-form content packs",
      "Hooks",
      "Captions",
      "Branded visuals",
      "Subtitles",
      "Reels/TikToks",
      "Posting-ready content ideas",
    ],
  },
  {
    title: "Websites & Landing Pages",
    icon: Globe2,
    description:
      "Focused web pages that help people understand, book, buy, join, or stream.",
    items: [
      "Business pages",
      "Artist pages",
      "Product pages",
      "Booking pages",
      "App landing pages",
      "Lead capture pages",
    ],
  },
  {
    title: "Apps & Digital Tools",
    icon: Layers3,
    description:
      "Real systems for people who need more than a page: tools, flows, and MVP maps.",
    items: [
      "Study apps",
      "Booking systems",
      "Digital workspaces",
      "Game concepts",
      "MVP planning",
      "Internal tools",
      "AI-supported workflows",
    ],
  },
  {
    title: "AI / Automation Workflows",
    icon: Bot,
    description:
      "Creative and business workflows that reduce busywork and sharpen output.",
    items: [
      "Content systems",
      "Media workflows",
      "Business automations",
      "Clip engines",
      "Studio workflows",
      "Productivity tools",
    ],
  },
];

export const lanes = [
  {
    title: "Capture The Moment",
    subtitle: "Wedding, event, portrait, brand, and promo photography.",
    cta: "Book Visual Work",
    href: "#start-project",
    tone: "blue",
  },
  {
    title: "Build The Brand",
    subtitle:
      "Logos, flyers, content packs, social media kits, landing pages, and launch visuals.",
    cta: "Build My Brand",
    href: "#start-project",
    tone: "green",
  },
  {
    title: "Launch The Tool",
    subtitle:
      "Apps, booking tools, study apps, MVP maps, automations, and digital workflows.",
    cta: "Start A Build",
    href: "#start-project",
    tone: "chrome",
  },
  {
    title: "Enter The Universe",
    subtitle:
      "Music, games, original projects, AI systems, digital artists, and DFB experiments.",
    cta: "Explore Projects",
    href: "#featured-builds",
    tone: "heat",
  },
];
