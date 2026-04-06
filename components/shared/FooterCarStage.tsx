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
    [0, 0.18, 0.72, 1],
    [0, 0, 0.86, 1]
  );
  const stageY = useTransform(revealProgress, [0, 0.45, 1], ["18%", "8%", "0%"]);
  const stageScale = useTransform(revealProgress, [0, 1], [0.94, 1]);
  const glowOpacity = useTransform(revealProgress, [0.16, 0.58, 1], [0, 0.34, 0.2]);
  const spinProgress = useTransform(revealProgress, [0.12, 1], [0, 1]);
  const stageStyle = reducedMotion
    ? { bottom: "calc(var(--footer-content-height) - 0.5rem)" }
    : {
        bottom: "calc(var(--footer-content-height) - 0.5rem)",
        opacity: stageOpacity,
        y: stageY,
        scale: stageScale,
      };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(164,187,214,0.14),transparent_55%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <motion.div
        className="absolute inset-x-0 top-0 px-6 lg:px-12"
        style={stageStyle}
      >
        <div className="mx-auto h-full w-full max-w-6xl">
          <div className="relative h-full overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01)_58%,rgba(255,255,255,0))] shadow-[0_32px_90px_rgba(0,0,0,0.42)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.1),transparent_54%)]" />
            <motion.div
              className="absolute left-1/2 top-[48%] h-[15rem] w-[44rem] -translate-x-1/2 rounded-full bg-white/10 blur-[120px]"
              style={reducedMotion ? undefined : { opacity: glowOpacity }}
            />
            <div
              className="absolute inset-0"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 16%, black 72%, transparent 100%)",
              }}
            >
              <div className="pointer-events-auto absolute inset-x-[3%] -bottom-[18%] top-[-16%]">
                <InteractiveCarModel
                  boundsMargin={1.05}
                  cameraPosition={[0, 1.05, 8]}
                  className="mx-auto max-w-[920px]"
                  rotationProgress={spinProgress}
                />
              </div>
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),transparent_22%,transparent_78%,rgba(0,0,0,0.34))]" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
