import type { Metadata } from "next";
import BuildsAmbientBackground from "@/components/builds/BuildsAmbientBackground";
import BuildsHero from "@/components/builds/BuildsHero";
import BuildsShowcase from "@/components/builds/BuildsShowcase";
import GitHubPanel from "@/components/builds/GitHubPanel";
import MenuButton from "@/components/homepage/MenuButton";
import SiteFooter from "@/components/shared/SiteFooter";

export const metadata: Metadata = {
  title: "Builds | Diego Aguirre",
  description: "Selected builds, systems, and product work by Diego Aguirre.",
};

export default function BuildsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <MenuButton />
      <BuildsHero />
      <div className="relative">
        <BuildsAmbientBackground />
        <div className="relative z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_16%)]">
          <BuildsShowcase />
          <GitHubPanel />
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
