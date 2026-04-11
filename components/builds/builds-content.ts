import type { BuildProject, PastProject } from "@/components/builds/types";
import BigRedWebImage from "@/guis/BigRedWeb.png";
import DeegzDevImage from "@/guis/DeegzDev.png";
import InferEconImage from "@/guis/InferEcon.png";
import InstaBotAwsImage from "@/guis/InstaBot_AWS.png";
import InstaBotChromeImage from "@/guis/InstaBotChromeExtension.png";
import InstaBotManualImage from "@/guis/InstaBotManual.png";
import RecycLensImage from "@/guis/RecyLens_React.png";
import SentimentWatchImage from "@/guis/SentimentWatchDemoGUI.png";
import StockHubImage from "@/guis/StockHubDemoGUI.png";
import TheraMistyImage from "@/guis/theramisty.png";

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
    "My wheels are always spinning: one live platform, one beta waitlist-stage app, and one validation-stage acquisition workflow.",
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

export const pastProjectsSectionCopy = {
  eyebrow: "Archive",
  heading: "Past Projects",
  description:
    "Selected public repositories from earlier product, automation, and web experiments.",
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
  StockHUB: {
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
    name: "StockHUB",
    href: "https://github.com/insdaguirre/Stock_Hub",
    repository: "insdaguirre/Stock_Hub",
    imageSrc: pastProjectImageMap.StockHUB.src,
    imageAlt: "StockHUB project preview",
    imageWidth: pastProjectImageMap.StockHUB.width,
    imageHeight: pastProjectImageMap.StockHUB.height,
    badgeLabel: "GitHub",
    ctaLabel: "Open Repository",
    demoUrl: "https://diego-aguirre.com/StockHub-Demo/",
    demoLabel: "View Demo",
    ariaLabel: "Open StockHUB on GitHub",
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
];
