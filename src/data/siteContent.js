import {
  Bot,
  BriefcaseBusiness,
  CalendarCheck,
  ChartNoAxesCombined,
  ClipboardList,
  Component,
  FileStack,
  Flame,
  Globe2,
  Layers3,
  Megaphone,
  Paintbrush,
  Rocket,
  Sparkles,
  Store,
  Users,
  Wrench,
} from "lucide-react";

export const services = [
  {
    title: "Business Websites",
    icon: Globe2,
    outcome:
      "A clean, official home base that explains the offer, builds trust, and turns visitors into leads.",
    includes: ["Landing pages", "Service pages", "Contact flows", "Launch polish"],
    projectType: "Website",
  },
  {
    title: "Booking Apps",
    icon: CalendarCheck,
    outcome:
      "A smoother way for clients to choose services, request time, and understand what happens next.",
    includes: ["Service menus", "Booking flows", "Client details", "Admin views"],
    projectType: "Booking system",
  },
  {
    title: "Admin Dashboards",
    icon: ChartNoAxesCombined,
    outcome:
      "A private workspace that puts leads, clients, tasks, content, or operations in one useful place.",
    includes: ["Internal tools", "Metrics", "Task views", "Owner controls"],
    projectType: "Admin dashboard",
  },
  {
    title: "CRM / Customer Systems",
    icon: Users,
    outcome:
      "A customer pipeline that helps you track people, conversations, follow-ups, and next steps.",
    includes: ["Lead capture", "Client records", "Follow-ups", "Status tracking"],
    projectType: "Booking system",
  },
  {
    title: "Custom App Builds",
    icon: Component,
    outcome:
      "A real product path for founders and creators who need more than a pretty page.",
    includes: ["MVP planning", "Product flows", "Core features", "Prototype builds"],
    projectType: "Custom app",
  },
  {
    title: "Content Systems",
    icon: FileStack,
    outcome:
      "Repeatable content engines that help your brand show up with structure instead of random posts.",
    includes: ["Hooks", "Captions", "Rollout plans", "Creative direction"],
    projectType: "Content/brand visuals",
  },
  {
    title: "AI Workflows",
    icon: Bot,
    outcome:
      "Automation and AI-assisted systems that cut busywork and make your business move smarter.",
    includes: ["Automations", "Dashboards", "Prompt systems", "Internal workflows"],
    projectType: "AI workflow",
  },
  {
    title: "Brand Visuals / Launch Assets",
    icon: Paintbrush,
    outcome:
      "The visual pieces that make a launch feel intentional, recognizable, and ready for the public.",
    includes: ["Promo graphics", "Flyers", "Brand kits", "Social assets"],
    projectType: "Content/brand visuals",
  },
];

export const audiences = [
  {
    title: "Service Providers",
    icon: Store,
    copy: "Estheticians, barbers, beauty brands, wellness pros, and service businesses that need bookings, credibility, and clean client flow.",
  },
  {
    title: "Creators And Artists",
    icon: Megaphone,
    copy: "Artists, podcasters, clothing brands, and content-first founders who need their world to look official online.",
  },
  {
    title: "Local Businesses",
    icon: BriefcaseBusiness,
    copy: "Shops, teams, and local brands that are tired of looking unfinished when customers search them up.",
  },
  {
    title: "App Idea Owners",
    icon: Rocket,
    copy: "Entrepreneurs with notes, screenshots, or a rough concept who need structure, screens, and a first build.",
  },
  {
    title: "System Builders",
    icon: Wrench,
    copy: "People who do not just need a design. They need dashboards, customer flows, automation, and repeatable operations.",
  },
];

export const projects = [
  {
    title: "ReemTeam",
    category: "Game Platform",
    status: "In Progress",
    accent: "signal",
    description:
      "Original card game platform direction with gameplay logic, table concepts, lobby flow, and mobile-first product planning.",
    tags: ["Game logic", "Mobile product", "Original IP"],
    cta: "View Case Study",
  },
  {
    title: "MAH Esti",
    category: "Beauty Tech",
    status: "In Progress",
    accent: "rose",
    description:
      "Beauty/service business system direction for official web presence, booking paths, brand assets, and client-facing polish.",
    tags: ["Booking", "Beauty brand", "Client flow"],
    cta: "Coming Soon",
  },
  {
    title: "TaskTrace",
    category: "Daily Urgency App",
    status: "Prototype",
    accent: "heat",
    description:
      "A daily mission and urgency app concept built around turning intention into visible next actions and accountable momentum.",
    tags: ["Productivity", "Daily missions", "Habit flow"],
    cta: "Coming Soon",
  },
  {
    title: "Payroll App",
    category: "Business Tool",
    status: "Prototype",
    accent: "voltage",
    description:
      "Internal payroll and operations concept for clearer worker records, pay periods, calculations, and owner visibility.",
    tags: ["Admin tool", "Operations", "Records"],
    cta: "Coming Soon",
  },
  {
    title: "RideOut",
    category: "Community / Mobility",
    status: "Prototype",
    accent: "chrome",
    description:
      "A product concept for organizing rides, people, routes, and community activity into a cleaner digital experience.",
    tags: ["Community", "Maps", "Planning"],
    cta: "Coming Soon",
  },
  {
    title: "SignalFlow",
    category: "Market Workspace",
    status: "Internal Build",
    accent: "voltage",
    description:
      "Trading workspace concept for signals, watchlists, journaling, risk context, and sharper decision routines.",
    tags: ["Signals", "Journal", "Dashboard"],
    cta: "Coming Soon",
  },
  {
    title: "DFB Solutions",
    category: "Studio Platform",
    status: "Live",
    accent: "signal",
    featured: true,
    description:
      "The agency headquarters: services, proof, intake, and a foundation for future HQ tools like leads, clients, projects, and invoices.",
    tags: ["Studio site", "Lead capture", "Future HQ"],
    cta: "Start A Project",
  },
];

export const offers = [
  {
    title: "Launch Site",
    label: "Starting At",
    fit: "For businesses that need a clean, official web presence.",
    details: ["Homepage or landing page", "Mobile-first layout", "Lead capture", "Launch-ready copy"],
  },
  {
    title: "Booking & CRM System",
    label: "Custom Quote",
    fit: "For service providers who need bookings, services, customers, and admin tools.",
    details: ["Booking flow", "Customer records", "Service setup", "Admin workspace"],
  },
  {
    title: "Custom App Build",
    label: "Request Quote",
    fit: "For founders and creators with a real product idea.",
    details: ["MVP scope", "Core screens", "App logic", "Launch roadmap"],
  },
  {
    title: "Content Engine",
    label: "Starting At",
    fit: "For brands that need short-form content systems, promo visuals, and rollout assets.",
    details: ["Hooks and captions", "Promo visuals", "Campaign rhythm", "Reusable system"],
  },
  {
    title: "AI Workflow Setup",
    label: "Custom Quote",
    fit: "For businesses that need automation, internal tools, dashboards, or smarter workflows.",
    details: ["Automation map", "AI prompts", "Internal dashboard", "Workflow setup"],
  },
];

export const processSteps = [
  {
    title: "Idea",
    copy: "Bring the rough version, notes, screenshots, voice memo, or half-built thing.",
  },
  {
    title: "Plan",
    copy: "We turn the idea into scope, priorities, screens, content, and a real build path.",
  },
  {
    title: "Build",
    copy: "Design, code, systems, copy, and workflow pieces start becoming something usable.",
  },
  {
    title: "Launch",
    copy: "The first public or private version goes live with the essentials handled cleanly.",
  },
  {
    title: "Improve",
    copy: "We sharpen the system based on real use, better ideas, and next-stage momentum.",
  },
];

export const proofStats = [
  ["Idea", "to execution"],
  ["Sites", "apps, systems"],
  ["Design", "code, content"],
  ["Lead", "capture ready"],
];

export const projectTypeOptions = [
  "Website",
  "Booking system",
  "Admin dashboard",
  "Custom app",
  "Content/brand visuals",
  "AI workflow",
  "Not sure yet",
];

export const budgetOptions = [
  "Under $500",
  "$500-$1,000",
  "$1,000-$2,500",
  "$2,500+",
  "Not sure yet",
];

export const heroSignals = [
  { label: "Websites", icon: Globe2 },
  { label: "Apps", icon: Component },
  { label: "Dashboards", icon: ClipboardList },
  { label: "AI Workflows", icon: Bot },
  { label: "Launch Assets", icon: Sparkles },
  { label: "Momentum", icon: Flame },
];
