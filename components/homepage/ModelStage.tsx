"use client";

import type { MotionValue } from "framer-motion";
import { motion, useTransform } from "framer-motion";
import ModelViewerPlaceholder from "@/components/homepage/ModelViewerPlaceholder";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ModelStageProps {
  scrollYProgress: MotionValue<number>;
}

export default function ModelStage({
  scrollYProgress,
}: ModelStageProps) {
  const reducedMotion = useReducedMotion();
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.06, 0.68, 0.86, 1],
    [0.18, 0.9, 1, 0, 0]
  );
  const y = useTransform(
    scrollYProgress,
    [0, 0.18, 0.68, 0.86, 1],
    ["34%", "0%", "0%", "-26%", "-26%"]
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.18, 0.68, 0.86, 1],
    [0.82, 1, 1, 0.92, 0.92]
  );
  const glowOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.68, 0.86, 1],
    [0.08, 0.22, 0.14, 0, 0]
  );

  return (
    <motion.section
      aria-hidden="true"
      className="absolute inset-0 z-10"
      style={reducedMotion ? undefined : { opacity, y, scale }}
    >
      <div className="relative flex h-full w-full items-center justify-center px-4 sm:px-8">
        <motion.div
          className="pointer-events-none absolute inset-x-[10%] top-[50%] h-[20rem] rounded-full bg-white/10 blur-[130px]"
          style={reducedMotion ? undefined : { opacity: glowOpacity }}
        />
        <ModelViewerPlaceholder scrollYProgress={scrollYProgress} />
      </div>
    </motion.section>
  );
}
