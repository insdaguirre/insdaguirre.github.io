import type { StaticImageData } from "next/image";

export interface BuildLink {
  href: string;
  label: string;
  external?: boolean;
  ariaLabel?: string;
}

export interface BuildProject {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status?: string;
  statusTone?: "default" | "live" | "beta" | "validation";
  label?: string;
  summary?: string;
  primaryLink?: BuildLink;
  secondaryLinks?: BuildLink[];
}

export interface PastProject {
  name: string;
  href: string;
  repository: string;
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
