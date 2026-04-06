import type { Metadata } from "next";
import AboutContent from "@/components/about/AboutContent";
import AboutHero from "@/components/about/AboutHero";
import MenuButton from "@/components/homepage/MenuButton";
import AmbientGridBackground from "@/components/shared/AmbientGridBackground";
import RevealFooterLayout from "@/components/shared/RevealFooterLayout";

export const metadata: Metadata = {
  title: "About | Diego Aguirre",
  description: "About Diego Aguirre: builder, technologist, founder.",
};

export default function AboutPage() {
  return (
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
  );
}
