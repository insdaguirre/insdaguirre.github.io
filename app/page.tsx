import type { Metadata } from "next";
import HomeExperience from "@/components/homepage/HomeExperience";
import HomeNarrativeSection from "@/components/homepage/HomeNarrativeSection";
import JsonLd from "@/components/seo/JsonLd";
import RevealFooterLayout from "@/components/shared/RevealFooterLayout";
import { createPageMetadata } from "@/lib/site";
import { createHomePageSchema } from "@/lib/structured-data";

export const metadata: Metadata = createPageMetadata({
  title: "Diego Aguirre | Product Engineer, Founder, and Builder",
  description:
    "Product-minded software engineer and founder building AI products, decision systems, and premium interfaces. Explore Diego Aguirre's builds, background, and current work.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <JsonLd data={createHomePageSchema()} />
      <RevealFooterLayout>
        <HomeExperience />
        <HomeNarrativeSection />
      </RevealFooterLayout>
    </>
  );
}
