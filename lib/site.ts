import type { Metadata } from "next";

export interface SiteLink {
  href: string;
  label: string;
  external?: boolean;
  ariaLabel?: string;
}

interface SiteConfig {
  name: string;
  url: string;
  defaultTitle: string;
  defaultDescription: string;
  locale: string;
  socialImage: string;
  socialImageAlt: string;
  icon: string;
  jobTitle: string;
  sameAs: string[];
  focusAreas: string[];
  primaryNavigationLinks: SiteLink[];
  menuSocialLinks: SiteLink[];
  footerLinks: SiteLink[];
  contact: {
    email?: string;
    linkedinUrl?: string;
    resumeUrl?: string;
    publishedLinks: SiteLink[];
    surfaceLinks: SiteLink[];
    hasPublishedDirectContactLinks: boolean;
    missingFields: string[];
  };
  verification: {
    google?: string;
  };
  analytics: {
    plausibleDomain?: string;
    plausibleScriptSrc?: string;
    plausibleApiHost?: string;
  };
}

interface SocialImageOverride {
  url: string;
  width: number;
  height: number;
  alt: string;
}

function readOptionalEnv(name: string) {
  const value = process.env[name]?.trim();

  return value ? value : undefined;
}

function createExternalLink(
  href: string | undefined,
  label: string,
  ariaLabel?: string
): SiteLink | null {
  if (!href) {
    return null;
  }

  return {
    href,
    label,
    external: true,
    ariaLabel,
  };
}

const contactEmail = readOptionalEnv("CONTACT_EMAIL");
const linkedinUrl = readOptionalEnv("LINKEDIN_URL");
const resumeUrl = readOptionalEnv("RESUME_URL");

const githubProfileLink: SiteLink = {
  href: "https://www.linkedin.com/in/diego-aguirre-110729219/",
  label: "Contact",
  external: true,
  ariaLabel: "Open Diego Aguirre's LinkedIn profile",
};

const instagramProfileLink: SiteLink = {
  href: "https://www.instagram.com/deegz.mp3/",
  label: "Alter-Ego",
  external: true,
  ariaLabel: "Open Diego Aguirre's Instagram profile",
};

const linkedInProfileLink = createExternalLink(
  linkedinUrl,
  "LinkedIn",
  "Open Diego Aguirre's LinkedIn profile"
);

const resumeLink = resumeUrl
  ? {
      href: resumeUrl,
      label: "Resume",
      external: /^https?:\/\//.test(resumeUrl),
      ariaLabel: "Open Diego Aguirre's resume",
    }
  : null;

const emailLink = contactEmail
  ? {
      href: `mailto:${contactEmail}`,
      label: "Email",
      ariaLabel: `Email ${contactEmail}`,
    }
  : null;

const primaryNavigationLinks: SiteLink[] = [
  {
    href: "/",
    label: "Home",
    ariaLabel: "Go to the home page",
  },
  {
    href: "/about/",
    label: "About",
    ariaLabel: "Go to the about page",
  },
  {
    href: "/builds/",
    label: "Builds",
    ariaLabel: "Go to the builds page",
  },
];

const publicProfileLinks = [
  githubProfileLink,
  linkedInProfileLink,
  instagramProfileLink,
].filter((link): link is SiteLink => Boolean(link));

const publishedContactLinks = [emailLink, linkedInProfileLink, resumeLink].filter(
  (link): link is SiteLink => Boolean(link)
);

const hasPublishedDirectContactLinks = publishedContactLinks.length > 0;

export const siteConfig = {
  name: "Diego Aguirre",
  url: "https://diego-aguirre.com",
  defaultTitle: "Diego Aguirre | Product Engineer, Founder, and Builder",
  defaultDescription:
    "Product-minded software engineer and founder building AI products, decision systems, and premium interfaces.",
  locale: "en_US",
  socialImage: "/og/diego-aguirre-preview.png",
  socialImageAlt: "Preview of Diego Aguirre's personal website",
  icon: "/icon.svg",
  jobTitle: "Product-minded Software Engineer and Founder",
  sameAs: publicProfileLinks.map((link) => link.href),
  focusAreas: [
    "AI products",
    "Product engineering",
    "Workflow systems",
    "Decision surfaces",
    "Founder-led execution",
  ],
  primaryNavigationLinks,
  menuSocialLinks: publicProfileLinks.filter((link) => link.label !== "Alter-Ego"),
  footerLinks: [...primaryNavigationLinks, ...publicProfileLinks],
  contact: {
    email: contactEmail,
    linkedinUrl,
    resumeUrl,
    publishedLinks: publishedContactLinks,
    surfaceLinks: hasPublishedDirectContactLinks
      ? [...publishedContactLinks, githubProfileLink]
      : [githubProfileLink],
    hasPublishedDirectContactLinks,
    missingFields: [
      contactEmail ? null : "CONTACT_EMAIL",
      linkedinUrl ? null : "LINKEDIN_URL",
      resumeUrl ? null : "RESUME_URL",
    ].filter((value): value is string => Boolean(value)),
  },
  verification: {
    google: readOptionalEnv("GOOGLE_SITE_VERIFICATION"),
  },
  analytics: {
    plausibleDomain: readOptionalEnv("PLAUSIBLE_DOMAIN"),
    plausibleScriptSrc:
      readOptionalEnv("PLAUSIBLE_SCRIPT_SRC") ?? "https://plausible.io/js/script.js",
    plausibleApiHost: readOptionalEnv("PLAUSIBLE_API_HOST"),
  },
} satisfies SiteConfig;

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, siteConfig.url).toString();
}

interface CreatePageMetadataOptions {
  title: string;
  description: string;
  path: string;
  socialImageOverride?: SocialImageOverride;
}

export function createPageMetadata({
  title,
  description,
  path,
  socialImageOverride,
}: CreatePageMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const socialImage = socialImageOverride ?? {
    url: siteConfig.socialImage,
    width: 3024,
    height: 1724,
    alt: siteConfig.socialImageAlt,
  };

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: [
        {
          url: socialImage.url,
          width: socialImage.width,
          height: socialImage.height,
          alt: socialImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage.url],
    },
  };
}
