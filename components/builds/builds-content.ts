import type { BuildProject } from "@/components/builds/types";

export const buildProjects: BuildProject[] = [
  {
    id: "Build 01",
    label: "Featured Build",
    name: "Narrative",
    status: "LIVE",
    statusTone: "live",
    description:
      "A higher-ed intelligence and response platform for helping campus teams detect emerging narratives early, prioritize risk, and coordinate action through a daily operating workflow.",
    summary:
      "Built as a production-minded system spanning monitoring, briefing, and response workflows for communications and student affairs teams.",
    tags: ["NEXT.JS", "MULTI-TENANT", "WORKFLOWS", "AI OPS"],
    primaryLink: {
      href: "https://www.narrative-edu.com/",
      label: "Visit Narrative",
      ariaLabel: "Visit the Narrative live site",
      external: true,
    },
    secondaryLinks: [
      {
        href: "https://github.com/insdaguirre/narrative-edu",
        label: "GitHub",
        ariaLabel: "Open the Narrative GitHub repository",
        external: true,
      },
    ],
  },
  {
    id: "Build 02",
    label: "Join Waitlist",
    name: "CRAIIVE",
    status: "BETA",
    statusTone: "beta",
    description:
      "An AI-powered food inventory app that helps users track what they have, get expiration alerts, and discover personalized recipes from the ingredients already on hand.",
    summary:
      "Built to make grocery planning smarter, reduce waste, and turn everyday food habits into a more curated workflow.",
    tags: ["FLUTTER", "FIRESTORE", "FIREBASE", "GEMINI"],
    primaryLink: {
      href: "https://www.craiive.com/",
      label: "Visit CRAIIVE",
      ariaLabel: "Visit the CRAIIVE beta waitlist site",
      external: true,
    },
  },
  {
    id: "Build 03",
    label: "Validation Stage",
    name: "NestIQ",
    status: "VALIDATION",
    statusTone: "validation",
    description:
      "A seller intelligence platform for real estate acquisition teams that surfaces which homeowners are most likely to sell and turns fragmented market signals into a ranked worklist.",
    tags: ["SELLER INTEL", "ACQUISITION", "LEAD SCORING", "WORKFLOWS"],
  },
];

export const buildsShowcaseCopy = {
  eyebrow: "Recent Work",
  heading:
    "Shipping across higher-ed intelligence, consumer AI, and acquisition workflows.",
  description:
    "A current read on the products in motion right now: one live platform, one beta waitlist-stage app, and one validation-stage acquisition workflow direction.",
};

export const recentWorkSignals = [
  {
    stage: "LIVE NOW",
    title: "Narrative",
    detail: "Production higher-ed intelligence and response workflows.",
  },
  {
    stage: "BETA",
    title: "CRAIIVE",
    detail: "Waitlist-stage consumer AI for inventory, planning, and recipes.",
  },
  {
    stage: "VALIDATION",
    title: "NestIQ",
    detail: "Acquisition workflow direction being pressure-tested through validation.",
  },
] as const;

export const githubPanelCopy = {
  eyebrow: "GitHub Context",
  heading: "Public repositories stay close to the work where open product detail adds signal.",
  description:
    "Narrative includes a public repository that documents the architecture behind the live platform. CRAIIVE is represented through its beta-stage product, and NestIQ remains framed here as a validation-stage direction rather than a public codebase.",
};

export const githubSignals = [
  {
    label: "Open Repo",
    description:
      "Narrative's public repo documents the higher-ed platform's multi-tenant, workflow, and AI-assisted system design.",
  },
  {
    label: "Selective Visibility",
    description:
      "Not every build on the page maps to a public codebase. Some products are shown through the product itself, while validation-stage work stays intentionally high level.",
  },
  {
    label: "Supporting Context",
    description:
      "GitHub supports the portfolio here as implementation context, not as a replacement for the shipped product.",
  },
] as const;
