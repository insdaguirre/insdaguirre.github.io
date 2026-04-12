import type { Metadata } from "next";

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
  sameAs: [
    "https://github.com/insdaguirre",
    "https://www.instagram.com/deegz.mp3/",
  ],
  focusAreas: [
    "AI products",
    "Product engineering",
    "Workflow systems",
    "Decision surfaces",
    "Founder-led execution",
  ],
} as const;

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, siteConfig.url).toString();
}

interface CreatePageMetadataOptions {
  title: string;
  description: string;
  path: string;
}

export function createPageMetadata({
  title,
  description,
  path,
}: CreatePageMetadataOptions): Metadata {
  const url = absoluteUrl(path);

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
          url: siteConfig.socialImage,
          width: 3024,
          height: 1724,
          alt: siteConfig.socialImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [siteConfig.socialImage],
    },
  };
}

