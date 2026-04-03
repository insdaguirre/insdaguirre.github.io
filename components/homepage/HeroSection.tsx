"use client";

import type { MotionValue } from "framer-motion";
import { motion, useTransform } from "framer-motion";
import ASCIIText from "@/components/homepage/ASCIIText";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface HeroSectionProps {
  scrollYProgress: MotionValue<number>;
}

export default function HeroSection({
  scrollYProgress,
}: HeroSectionProps) {
  const reducedMotion = useReducedMotion();
  const opacity = useTransform(scrollYProgress, [0, 0.01, 0.025, 1], [1, 0.1, 0, 0]);
  const y = useTransform(scrollYProgress, [0, 0.025, 1], ["0%", "-10%", "-10%"]);
  const scale = useTransform(scrollYProgress, [0, 0.025, 1], [1, 0.99, 0.99]);

  return (
    <motion.section
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6"
      style={reducedMotion ? undefined : { opacity, y, scale }}
    >
      <div className="text-center">
        <h1 className="sr-only">Diego Aguirre</h1>
        <div
          aria-hidden="true"
          className="relative mx-auto h-[clamp(16rem,24vw,20rem)] w-[min(100vw,95rem)]"
        >
          <ASCIIText
            text="Diego Aguirre"
            textColor="#fdf9f3"
            enableWaves
          />
        </div>
      </div>
    </motion.section>
  );
}
