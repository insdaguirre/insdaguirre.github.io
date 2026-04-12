import type { Metadata } from "next";
import AboutContent from "@/components/about/AboutContent";
import AboutHero from "@/components/about/AboutHero";
import MenuButton from "@/components/homepage/MenuButton";
import JsonLd from "@/components/seo/JsonLd";
import AmbientGridBackground from "@/components/shared/AmbientGridBackground";
import RevealFooterLayout from "@/components/shared/RevealFooterLayout";
import { createPageMetadata } from "@/lib/site";
import { createAboutPageSchema } from "@/lib/structured-data";

const aboutPageDescription =
  "About Diego Aguirre, a product-minded software engineer and founder focused on AI products, clean systems, and user-centered execution.";

export const metadata: Metadata = createPageMetadata({
  title: "About Diego Aguirre",
  description: aboutPageDescription,
  path: "/about/",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd data={createAboutPageSchema(aboutPageDescription)} />
      <RevealFooterLayout surfaceClassName="overflow-hidden">
        <MenuButton />
        <AboutHero />
        <div className="relative">
          <AmbientGridBackground />
          <div className="relative z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_16%)]">
            <AboutContent />
          </div>
        </div>
      </RevealFooterLayout>
    </>
  );
}
