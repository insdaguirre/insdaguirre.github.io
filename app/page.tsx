"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import HeroSection from "@/components/homepage/HeroSection";
import IdentitySection from "@/components/homepage/IdentitySection";
import MenuButton from "@/components/homepage/MenuButton";
import DotGrid from "@/components/shared/DotGrid";
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
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
            <DotGrid
              dotSize={5}
              gap={15}
              baseColor="#271E37"
              activeColor="#5227FF"
              proximity={120}
              shockRadius={250}
              shockStrength={5}
              resistance={750}
              returnDuration={1.5}
            />
          </div>
          <HeroSection scrollYProgress={scrollYProgress} />
          <ModelStage scrollYProgress={scrollYProgress} />
          <IdentitySection scrollYProgress={scrollYProgress} />
        </div>
      </section>
    </main>
  );
}
