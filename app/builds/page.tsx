import type { Metadata } from "next";
import BuildsHero from "@/components/builds/BuildsHero";
import BuildsShowcase from "@/components/builds/BuildsShowcase";
import GitHubPanel from "@/components/builds/GitHubPanel";
import MenuButton from "@/components/homepage/MenuButton";
import AmbientGridBackground from "@/components/shared/AmbientGridBackground";
import RevealFooterLayout from "@/components/shared/RevealFooterLayout";

export const metadata: Metadata = {
  title: "Builds | Diego Aguirre",
  description: "Selected builds, systems, and product work by Diego Aguirre.",
};

export default function BuildsPage() {
  return (
    <RevealFooterLayout surfaceClassName="overflow-hidden">
      <MenuButton />
      <BuildsHero />
      <div className="relative">
        <AmbientGridBackground />
        <div className="relative z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_16%)]">
          <BuildsShowcase />
          <GitHubPanel />
        </div>
      </div>
    </RevealFooterLayout>
  );
}
