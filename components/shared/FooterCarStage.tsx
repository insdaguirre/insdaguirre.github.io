"use client";

import type { MotionValue } from "framer-motion";
import { motion, useTransform } from "framer-motion";
import InteractiveCarModel from "@/components/shared/InteractiveCarModel";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FooterCarStageProps {
  revealProgress: MotionValue<number>;
}

export default function FooterCarStage({
  revealProgress,
}: FooterCarStageProps) {
  const reducedMotion = useReducedMotion();
  const stageOpacity = useTransform(
    revealProgress,
    [0, 0.12, 0.62, 1],
    [0, 0, 0.86, 1]
  );
  const stageY = useTransform(revealProgress, [0, 0.3, 1], ["22%", "8%", "0%"]);
  const stageScale = useTransform(revealProgress, [0, 1], [0.9, 1]);
  const spinProgress = useTransform(revealProgress, [0.04, 0.52, 1], [0, 0.72, 1]);
  const stageStyle = reducedMotion
    ? { bottom: "calc(var(--footer-content-height) - 0.65rem)" }
    : {
        bottom: "calc(var(--footer-content-height) - 0.65rem)",
        opacity: stageOpacity,
        y: stageY,
        scale: stageScale,
      };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 px-6 lg:px-12"
        style={stageStyle}
      >
        <div className="pointer-events-none mx-auto h-full w-full max-w-6xl">
          <div className="pointer-events-none relative h-full overflow-hidden">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 8%, black 88%, transparent 100%)",
              }}
            >
              <div className="pointer-events-auto absolute inset-x-[-4%] -bottom-[28%] top-[-24%]">
                <InteractiveCarModel
                  boundsMargin={0.76}
                  cameraPosition={[0, 1.15, 8]}
                  className="mx-auto max-w-[1180px]"
                  returnDamping={8.25}
                  returnStiffness={17}
                  rotationAmplitude={Math.PI * 2.15}
                  rotationProgress={spinProgress}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
