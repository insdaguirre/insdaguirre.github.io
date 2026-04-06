"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import HeroSection from "@/components/homepage/HeroSection";
import IdentitySection from "@/components/homepage/IdentitySection";
import MenuButton from "@/components/homepage/MenuButton";
import AboutHeroBackground from "@/components/shared/AboutHeroBackground";
import { useSectionScrollProgress } from "@/hooks/useSectionScrollProgress";

const ModelStage = dynamic(() => import("@/components/homepage/ModelStage"), {
  ssr: false,
});

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollYProgress = useSectionScrollProgress(scrollRef);

  return (
    <main className="relative min-h-screen bg-black text-white">
      <MenuButton />
      <section
        ref={scrollRef}
        aria-label="Intro sequence"
        className="relative h-[320vh]"
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="absolute inset-0 z-0">
            <AboutHeroBackground />
          </div>
          <HeroSection scrollYProgress={scrollYProgress} />
          <ModelStage scrollYProgress={scrollYProgress} />
          <IdentitySection scrollYProgress={scrollYProgress} />
        </div>
      </section>
    </main>
  );
}
