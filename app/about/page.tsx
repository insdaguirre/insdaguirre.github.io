import type { Metadata } from "next";
import AboutContent from "@/components/about/AboutContent";
import AboutHero from "@/components/about/AboutHero";
import MenuButton from "@/components/homepage/MenuButton";
import AmbientGridBackground from "@/components/shared/AmbientGridBackground";
import SiteFooter from "@/components/shared/SiteFooter";

export const metadata: Metadata = {
  title: "About | Diego Aguirre",
  description: "About Diego Aguirre: builder, technologist, founder.",
};

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <MenuButton />
      <AboutHero />
      <div className="relative">
        <AmbientGridBackground />
        <div className="relative z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_16%)]">
          <AboutContent />
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
