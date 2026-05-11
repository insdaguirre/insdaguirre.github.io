import type { Metadata } from "next";
import BuildsHero from "@/components/builds/BuildsHero";
import BuildsShowcase from "@/components/builds/BuildsShowcase";
import PastProjectsPanel from "@/components/builds/PastProjectsPanel";
import {
  buildProjects,
  getBuildProjectPath,
  pastProjects,
} from "@/components/builds/builds-content";
import MenuButton from "@/components/homepage/MenuButton";
import JsonLd from "@/components/seo/JsonLd";
import AmbientGridBackground from "@/components/shared/AmbientGridBackground";
import RevealFooterLayout from "@/components/shared/RevealFooterLayout";
import { createPageMetadata } from "@/lib/site";
import { createCollectionPageSchema } from "@/lib/structured-data";

const buildsPageDescription =
  "Selected AI products, experiments, and workflow systems by Diego Aguirre, spanning higher-ed intelligence, consumer AI, and acquisition tooling.";

export const metadata: Metadata = createPageMetadata({
  title: "Builds by Diego Aguirre",
  description: buildsPageDescription,
  path: "/builds/",
});

export default function BuildsPage() {
  const collectionItems = [
    ...buildProjects.map((project) => ({
      name: project.name,
      description: project.description,
      url: getBuildProjectPath(project.slug),
    })),
    ...pastProjects.map((project) => ({
      name: project.name,
      url: project.href,
    })),
  ];

  return (
    <>
      <JsonLd
        data={createCollectionPageSchema({
          name: "Builds by Diego Aguirre",
          description: buildsPageDescription,
          path: "/builds/",
          items: collectionItems,
        })}
      />
      <RevealFooterLayout surfaceClassName="overflow-hidden">
        <MenuButton />
        <BuildsHero />
        <div className="relative">
          <AmbientGridBackground />
          <div className="relative z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_16%)]">
            <BuildsShowcase />
            <PastProjectsPanel />
          </div>
        </div>
      </RevealFooterLayout>
    </>
  );
}
