import type {
  BuildProject,
  PastProject,
  RecentWorkSignal,
} from "@/components/builds/types";
import BigRedWebImage from "@/guis/BigRedWeb.png";
import CraiiveImage from "@/guis/Craiive.png";
import DeegzDevImage from "@/guis/DeegzDev.png";
import FAlphaImage from "@/guis/fAlpha.png";
import InferEconImage from "@/guis/InferEcon.png";
import InstaBotAwsImage from "@/guis/InstaBot_AWS.png";
import InstaBotChromeImage from "@/guis/InstaBotChromeExtension.png";
import InstaBotManualImage from "@/guis/InstaBotManual.png";
import NarrativeImage from "@/guis/Narrative.png";
import NestIQImage from "@/guis/NestIQ.png";
import RecycLensImage from "@/guis/RecyLens_React.png";
import SentimentWatchImage from "@/guis/SentimentWatchDemoGUI.png";
import StockHubImage from "@/guis/StockHubDemoGUI.png";
import TheraMistyImage from "@/guis/theramisty.png";

export function getBuildProjectPath(slug: string) {
  return `/builds/${slug}/`;
}

export const buildProjects: BuildProject[] = [
  {
    id: "Build 01",
    slug: "narrative",
    label: "Featured Build",
    name: "Narrative",
    image: NarrativeImage,
    imageAlt: "Narrative platform interface for higher-ed intelligence workflows",
    status: "LIVE",
    statusTone: "live",
    description:
      "A higher-ed intelligence and response platform for helping campus teams detect emerging narratives early, prioritize risk, and coordinate action through a daily operating workflow.",
    summary:
      "Built as a production-minded system spanning monitoring, briefing, and response workflows for communications and student affairs teams.",
    tags: ["NEXT.JS", "MULTI-TENANT", "WORKFLOWS", "AI OPS"],
    role:
      "Founder-led product engineering, workflow design, and system shaping across monitoring, briefing, and response operations.",
    stackSummary:
      "Next.js, multi-tenant product architecture, workflow systems, and AI-assisted operating loops.",
    statusSummary:
      "Live and framed as a production-facing higher-ed intelligence product for daily team use.",
    pageTitle: "Narrative | Higher-Ed Intelligence Platform by Diego Aguirre",
    pageDescription:
      "Narrative is a higher-ed intelligence and response platform by Diego Aguirre, built to help campus teams detect emerging narratives, prioritize risk, and coordinate action.",
    productType: "Higher education intelligence platform",
    detailSections: [
      {
        title: "What It Does",
        body:
          "Narrative is positioned as a daily operating layer for campus communications and student-affairs teams. The core job is to surface emerging narratives early, make them easier to interpret, and turn that signal into a response workflow that teams can actually run.",
      },
      {
        title: "How It Is Framed",
        body:
          "The product is described in the repo as a production-minded system spanning monitoring, briefing, and coordinated response. That framing matters because it moves beyond passive listening into an operational tool that helps teams prioritize, brief, and act.",
      },
      {
        title: "Why It Matters",
        body:
          "Higher-ed teams often need fast signal without adding more dashboard noise. Narrative is the strongest example in this site of product, workflow, and engineering being treated as one system rather than separate layers.",
      },
    ],
    primaryLink: {
      href: "https://github.com/insdaguirre/narrative-edu",
      label: "Open Narrative on GitHub",
      ariaLabel: "Open the Narrative GitHub repository",
      external: true,
    },
    secondaryLinks: [
      {
        href: "https://www.narrative-edu.com/",
        label: "Get started",
        ariaLabel: "Visit the Narrative live site",
        external: true,
      },
      {
        href: "https://github.com/insdaguirre/narrative-edu",
        label: "GitHub",
        ariaLabel: "Open the Narrative GitHub repository",
        external: true,
        icon: "github",
      },
    ],
    liveLink: {
      href: "https://www.narrative-edu.com/",
      label: "Visit Narrative",
      ariaLabel: "Visit the Narrative live site",
      external: true,
    },
    repositoryLink: {
      href: "https://github.com/insdaguirre/narrative-edu",
      label: "GitHub",
      ariaLabel: "Open the Narrative GitHub repository",
      external: true,
    },
  },
  {
    id: "Build 02",
    slug: "craiive",
    label: "Currently in beta",
    name: "CRAIIVE",
    image: CraiiveImage,
    imageAlt: "CRAIIVE mobile interface for food inventory and recipe planning",
    status: "BETA",
    statusTone: "beta",
    description:
      "An AI-powered food inventory app that helps users track what they have, get expiration alerts, and discover personalized recipes from the ingredients already on hand.",
    summary:
      "Built to make grocery planning smarter, reduce waste, and turn everyday food habits into a more curated workflow.",
    tags: ["FLUTTER", "FIRESTORE", "FIREBASE", "GEMINI"],
    role:
      "Product shaping, mobile workflow design, and AI-assisted feature integration around inventory, planning, and recipe discovery.",
    stackSummary:
      "Flutter, Firestore, Firebase, and Gemini-backed AI features.",
    statusSummary:
      "Beta and currently positioned as a waitlist-stage consumer AI product.",
    pageTitle: "CRAIIVE | AI Food Inventory App by Diego Aguirre",
    pageDescription:
      "CRAIIVE is an AI-powered food inventory app by Diego Aguirre, built to help users track ingredients, get expiration alerts, and discover recipes from what they already have.",
    productType: "Consumer AI food inventory application",
    detailSections: [
      {
        title: "What It Does",
        body:
          "CRAIIVE focuses on a familiar but messy consumer problem: people buy food without a clean picture of what they already have, when it expires, or what they can make next. The product centers that gap and turns inventory into a more guided workflow.",
      },
      {
        title: "How It Is Positioned",
        body:
          "The current framing ties together tracking, expiration reminders, and recipe discovery. That makes the product more than a pantry log. It becomes a lightweight decision layer for planning meals, reducing waste, and getting more value from ingredients already at home.",
      },
      {
        title: "Why It Matters",
        body:
          "CRAIIVE shows the consumer side of the portfolio: personal workflow improvement, tighter mobile UX constraints, and AI features used to simplify a repeated habit instead of adding novelty for its own sake.",
      },
    ],
    secondaryLinks: [
      {
        href: "https://www.craiive.com/",
        label: "Join Waitlist",
        ariaLabel: "Visit the CRAIIVE beta waitlist site",
        external: true,
      },
    ],
    liveLink: {
      href: "https://www.craiive.com/",
      label: "Visit CRAIIVE",
      ariaLabel: "Visit the CRAIIVE beta waitlist site",
      external: true,
    },
  },
  {
    id: "Build 03",
    slug: "nestiq",
    label: "Validation Stage",
    name: "NestIQ",
    image: NestIQImage,
    imageAlt: "NestIQ interface concept for real estate acquisition workflows",
    status: "VALIDATION",
    statusTone: "validation",
    description:
      "A seller intelligence platform for real estate acquisition teams that surfaces which homeowners are most likely to sell and turns fragmented market signals into a ranked worklist.",
    tags: ["SELLER INTEL", "ACQUISITION", "LEAD SCORING", "WORKFLOWS"],
    role:
      "Validation-stage product framing, workflow modeling, and market-signal synthesis for acquisition operators.",
    stackSummary:
      "Seller-intelligence modeling, acquisition workflows, lead scoring, and ranked worklist design.",
    statusSummary:
      "Validation stage and currently being pressure-tested before a larger production commitment.",
    pageTitle: "NestIQ | Seller Intelligence Platform by Diego Aguirre",
    pageDescription:
      "NestIQ is a seller intelligence platform concept by Diego Aguirre, built to help real estate acquisition teams rank homeowners, prioritize outreach, and act on fragmented market signals.",
    productType: "Seller intelligence platform",
    detailSections: [
      {
        title: "What It Does",
        body:
          "NestIQ is framed around a real acquisition bottleneck: teams collect scattered market signals but still need a sharper way to decide where to spend time first. The product centers on converting that fragmented information into a prioritized worklist.",
      },
      {
        title: "How It Is Approached",
        body:
          "Unlike the live and beta products on the site, NestIQ is presented as a validation-stage build. That matters because the emphasis is on pressure-testing demand, workflow fit, and scoring logic before locking into a heavier implementation path.",
      },
      {
        title: "Why It Matters",
        body:
          "NestIQ adds a different operating context to the portfolio: acquisition teams, ranked seller intent, and workflow systems built around prioritization. It broadens the proof surface without pretending the product is further along than it is.",
      },
    ],
    secondaryLinks: [],
  },
];

export const buildsShowcaseCopy = {
  eyebrow: "Recent Work",
  heading:
    "Shipping AI products across higher-ed intelligence, consumer software, and acquisition workflows.",
  description:
    "A live higher-ed intelligence platform, a beta consumer AI product, and a validation-stage acquisition workflow system.",
};

export const recentWorkSignals: RecentWorkSignal[] = [
  {
    stage: "LIVE NOW",
    title: "Narrative",
    detail: "Production higher-ed intelligence and response workflows.",
    image: NarrativeImage,
    imageAlt: "Narrative platform interface for higher-ed intelligence workflows",
  },
  {
    stage: "BETA",
    title: "CRAIIVE",
    detail: "Waitlist-stage consumer AI for inventory, planning, and recipes.",
    image: CraiiveImage,
    imageAlt: "CRAIIVE mobile interface for food inventory and recipe planning",
  },
  {
    stage: "VALIDATION",
    title: "NestIQ",
    detail: "Acquisition workflow direction being pressure-tested through validation.",
    image: NestIQImage,
    imageAlt: "NestIQ interface concept for real estate acquisition workflows",
  },
];

export const pastProjectsSectionCopy = {
  eyebrow: "Archive",
  heading: "Past Work",
  description:
    "Earlier ventures spanning AI-research, machine learning, quantitative finance, and product design.",
};

const pastProjectImageMap = {
  TheraMisty: {
    src: TheraMistyImage.src,
    width: TheraMistyImage.width,
    height: TheraMistyImage.height,
  },
  SentimentWatch: {
    src: SentimentWatchImage.src,
    width: SentimentWatchImage.width,
    height: SentimentWatchImage.height,
  },
  InferEcon: {
    src: InferEconImage.src,
    width: InferEconImage.width,
    height: InferEconImage.height,
  },
  StockHub: {
    src: StockHubImage.src,
    width: StockHubImage.width,
    height: StockHubImage.height,
  },
  RecycLens: {
    src: RecycLensImage.src,
    width: RecycLensImage.width,
    height: RecycLensImage.height,
  },
  InstaBotLocal: {
    src: InstaBotManualImage.src,
    width: InstaBotManualImage.width,
    height: InstaBotManualImage.height,
  },
  InstaBotChrome: {
    src: InstaBotChromeImage.src,
    width: InstaBotChromeImage.width,
    height: InstaBotChromeImage.height,
  },
  InstaBotAWS: {
    src: InstaBotAwsImage.src,
    width: InstaBotAwsImage.width,
    height: InstaBotAwsImage.height,
  },
  BigRedWeb: {
    src: BigRedWebImage.src,
    width: BigRedWebImage.width,
    height: BigRedWebImage.height,
  },
  DeegzDev: {
    src: DeegzDevImage.src,
    width: DeegzDevImage.width,
    height: DeegzDevImage.height,
  },
  fAlpha: {
    src: FAlphaImage.src,
    width: FAlphaImage.width,
    height: FAlphaImage.height,
  },
} as const;

export const pastProjects: PastProject[] = [
  {
    name: "TheraMisty",
    href: "https://github.com/insdaguirre/TheraMistyOverview",
    repository: "insdaguirre/TheraMistyOverview",
    imageSrc: pastProjectImageMap.TheraMisty.src,
    imageAlt: "TheraMisty project preview",
    imageWidth: pastProjectImageMap.TheraMisty.width,
    imageHeight: pastProjectImageMap.TheraMisty.height,
    badgeLabel: "GitHub",
    ctaLabel: "Open Repository",
    ariaLabel: "Open TheraMisty on GitHub",
    external: true,
  },
  {
    name: "SentimentWatch",
    href: "https://github.com/insdaguirre/SentimentWatch",
    repository: "insdaguirre/SentimentWatch",
    imageSrc: pastProjectImageMap.SentimentWatch.src,
    imageAlt: "SentimentWatch project preview",
    imageWidth: pastProjectImageMap.SentimentWatch.width,
    imageHeight: pastProjectImageMap.SentimentWatch.height,
    badgeLabel: "GitHub",
    ctaLabel: "Open Repository",
    demoUrl: "https://diego-aguirre.com/SentimentWatch-Demo/",
    demoLabel: "View Demo",
    ariaLabel: "Open SentimentWatch on GitHub",
    external: true,
  },
  {
    name: "InferEcon",
    href: "https://github.com/insdaguirre/InferEcon",
    repository: "insdaguirre/InferEcon",
    imageSrc: pastProjectImageMap.InferEcon.src,
    imageAlt: "InferEcon project preview",
    imageWidth: pastProjectImageMap.InferEcon.width,
    imageHeight: pastProjectImageMap.InferEcon.height,
    badgeLabel: "GitHub",
    ctaLabel: "Open Repository",
    demoUrl: "https://inferecon.streamlit.app/",
    demoLabel: "View Demo",
    ariaLabel: "Open InferEcon on GitHub",
    external: true,
  },
  {
    name: "StockHub",
    href: "https://github.com/insdaguirre/Stock_Hub",
    repository: "insdaguirre/Stock_Hub",
    imageSrc: pastProjectImageMap.StockHub.src,
    imageAlt: "StockHub project preview",
    imageWidth: pastProjectImageMap.StockHub.width,
    imageHeight: pastProjectImageMap.StockHub.height,
    badgeLabel: "GitHub",
    ctaLabel: "Open Repository",
    demoUrl: "https://diego-aguirre.com/StockHub-Demo/",
    demoLabel: "View Demo",
    ariaLabel: "Open StockHub on GitHub",
    external: true,
  },
  {
    name: "RecycLens",
    href: "https://github.com/insdaguirre/RecycLens_React",
    repository: "insdaguirre/RecycLens_React",
    imageSrc: pastProjectImageMap.RecycLens.src,
    imageAlt: "RecycLens project preview",
    imageWidth: pastProjectImageMap.RecycLens.width,
    imageHeight: pastProjectImageMap.RecycLens.height,
    badgeLabel: "GitHub",
    ctaLabel: "Open Repository",
    ariaLabel: "Open RecycLens on GitHub",
    external: true,
  },
  {
    name: "InstaBotLocal",
    href: "https://github.com/insdaguirre/InstaGrowthManual",
    repository: "insdaguirre/InstaGrowthManual",
    imageSrc: pastProjectImageMap.InstaBotLocal.src,
    imageAlt: "InstaBotLocal project preview",
    imageWidth: pastProjectImageMap.InstaBotLocal.width,
    imageHeight: pastProjectImageMap.InstaBotLocal.height,
    badgeLabel: "GitHub",
    ctaLabel: "Open Repository",
    ariaLabel: "Open InstaBotLocal on GitHub",
    external: true,
  },
  {
    name: "InstaBotChrome",
    href: "https://github.com/insdaguirre/InstaBot_ChromeExtension",
    repository: "insdaguirre/InstaBot_ChromeExtension",
    imageSrc: pastProjectImageMap.InstaBotChrome.src,
    imageAlt: "InstaBotChrome project preview",
    imageWidth: pastProjectImageMap.InstaBotChrome.width,
    imageHeight: pastProjectImageMap.InstaBotChrome.height,
    badgeLabel: "GitHub",
    ctaLabel: "Open Repository",
    ariaLabel: "Open InstaBotChrome on GitHub",
    external: true,
  },
  {
    name: "InstaBotAWS",
    href: "https://github.com/insdaguirre/AWS_Instagram_Bot",
    repository: "insdaguirre/AWS_Instagram_Bot",
    imageSrc: pastProjectImageMap.InstaBotAWS.src,
    imageAlt: "InstaBotAWS project preview",
    imageWidth: pastProjectImageMap.InstaBotAWS.width,
    imageHeight: pastProjectImageMap.InstaBotAWS.height,
    badgeLabel: "GitHub",
    ctaLabel: "Open Repository",
    ariaLabel: "Open InstaBotAWS on GitHub",
    external: true,
  },
  {
    name: "BigRedWeb",
    href: "https://github.com/insdaguirre/Big_Red_Web",
    repository: "insdaguirre/Big_Red_Web",
    imageSrc: pastProjectImageMap.BigRedWeb.src,
    imageAlt: "BigRedWeb project preview",
    imageWidth: pastProjectImageMap.BigRedWeb.width,
    imageHeight: pastProjectImageMap.BigRedWeb.height,
    badgeLabel: "GitHub",
    ctaLabel: "Open Repository",
    ariaLabel: "Open BigRedWeb on GitHub",
    external: true,
  },
  {
    name: "Deegz.Dev",
    href: "https://github.com/insdaguirre/Old-Personal-Site-From-College",
    repository: "insdaguirre/Old-Personal-Site-From-College",
    imageSrc: pastProjectImageMap.DeegzDev.src,
    imageAlt: "Deegz.Dev project preview",
    imageWidth: pastProjectImageMap.DeegzDev.width,
    imageHeight: pastProjectImageMap.DeegzDev.height,
    badgeLabel: "GitHub",
    ctaLabel: "Open Repository",
    demoUrl: "https://diego-aguirre.com/Old-Personal-Site-From-College/",
    demoLabel: "View Demo",
    ariaLabel: "Open Deegz.Dev on GitHub",
    external: true,
  },
  {
    name: "fAlpha",
    href: "https://falpha.ai/",
    repository: "falpha.ai",
    linkKind: "external",
    imageSrc: pastProjectImageMap.fAlpha.src,
    imageAlt: "fAlpha project preview",
    imageWidth: pastProjectImageMap.fAlpha.width,
    imageHeight: pastProjectImageMap.fAlpha.height,
    badgeLabel: "Live Site",
    ctaLabel: "Visit Site",
    ariaLabel: "Visit the fAlpha live site",
    external: true,
  },
];

export function getBuildProjectBySlug(slug: string) {
  return buildProjects.find((project) => project.slug === slug);
}
