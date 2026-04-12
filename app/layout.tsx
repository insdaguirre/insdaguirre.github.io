import type { Metadata, Viewport } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { GeistSans } from "geist/font/sans";
import { siteConfig } from "@/lib/site";
import {
  createPersonSchema,
  createWebSiteSchema,
} from "@/lib/structured-data";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.defaultTitle,
  description: siteConfig.defaultDescription,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      {
        url: siteConfig.icon,
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    url: siteConfig.url,
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
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: [siteConfig.socialImage],
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="overflow-x-hidden bg-black font-sans text-white antialiased">
        <JsonLd data={[createWebSiteSchema(), createPersonSchema()]} />
        {children}
      </body>
    </html>
  );
}
