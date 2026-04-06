"use client";

import type { MotionValue } from "framer-motion";
import { useTransform } from "framer-motion";
import InteractiveCarModel from "@/components/shared/InteractiveCarModel";

interface ModelViewerPlaceholderProps {
  scrollYProgress: MotionValue<number>;
}

export default function ModelViewerPlaceholder({
  scrollYProgress,
}: ModelViewerPlaceholderProps) {
  const spinProgress = useTransform(scrollYProgress, [0.14, 0.72], [0, 1]);

  return (
    <InteractiveCarModel
      className="h-[66vh] max-w-[1080px]"
      returnDamping={10.5}
      returnStiffness={19}
      rotationProgress={spinProgress}
    />
  );
}
