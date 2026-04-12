import type { StaticImageData } from "next/image";

export interface BuildLink {
  href: string;
  label: string;
  external?: boolean;
  ariaLabel?: string;
  icon?: "github";
}

export interface ProjectDetailSection {
  title: string;
  body: string;
}

export interface BuildProject {
  id: string;
  slug: string;
  name: string;
  description: string;
  tags: string[];
  image: StaticImageData;
  imageAlt: string;
  status?: string;
  statusTone?: "default" | "live" | "beta" | "validation";
  label?: string;
  summary?: string;
  role: string;
  stackSummary: string;
  statusSummary: string;
  pageTitle: string;
  pageDescription: string;
  productType: string;
  detailSections: ProjectDetailSection[];
  primaryLink?: BuildLink;
  secondaryLinks?: BuildLink[];
  liveLink?: BuildLink;
  repositoryLink?: BuildLink;
}

export interface PastProject {
  name: string;
  href: string;
  repository: string;
  linkKind?: "github" | "external";
  imageSrc?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  badgeLabel?: string;
  ctaLabel?: string;
  demoUrl?: string;
  demoLabel?: string;
  ariaLabel?: string;
  external?: boolean;
}

export interface RecentWorkSignal {
  stage: string;
  title: string;
  detail: string;
  image: StaticImageData;
  imageAlt: string;
}
