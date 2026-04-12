import { absoluteUrl, siteConfig } from "@/lib/site";

export function createWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.defaultDescription,
    inLanguage: "en-US",
  };
}

export function createPersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    url: siteConfig.url,
    image: absoluteUrl(siteConfig.socialImage),
    description: siteConfig.defaultDescription,
    jobTitle: siteConfig.jobTitle,
    sameAs: [...siteConfig.sameAs],
    knowsAbout: [...siteConfig.focusAreas],
  };
}

export function createHomePageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: siteConfig.defaultTitle,
    url: siteConfig.url,
    description: siteConfig.defaultDescription,
    mainEntity: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.url,
      jobTitle: siteConfig.jobTitle,
    },
  };
}

export function createAboutPageSchema(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${siteConfig.name}`,
    url: absoluteUrl("/about/"),
    description,
    about: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

interface CollectionItem {
  name: string;
  url: string;
  description?: string;
}

interface CreateCollectionPageSchemaOptions {
  name: string;
  description: string;
  path: string;
  items: CollectionItem[];
}

export function createCollectionPageSchema({
  name,
  description,
  path,
  items,
}: CreateCollectionPageSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: absoluteUrl(path),
    description,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CreativeWork",
          name: item.name,
          url: item.url.startsWith("http") ? item.url : absoluteUrl(item.url),
          ...(item.description ? { description: item.description } : {}),
        },
      })),
    },
  };
}
