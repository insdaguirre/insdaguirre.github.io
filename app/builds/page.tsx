import type { Metadata } from "next";
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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_18%),linear-gradient(180deg,#050505_0%,#000_24%,#000_100%)]"
      />
      <BuildsHero />
      <div className="relative bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_16%)]">
        <BuildsShowcase />
        <GitHubPanel />
        <SiteFooter />
      </div>
    </main>
  );
}
