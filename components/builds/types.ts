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
}
