"use client";

import type { MotionValue } from "framer-motion";
import { motion, useTransform } from "framer-motion";
import GradientText from "@/components/homepage/GradientText";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const identityItems = ["BUILDER", "TECHNOLOGIST", "FOUNDER"] as const;
const introCopy =
  "Hi, I’m Diego. I am obsessed with users. I ship fast like an f1 car. I ask the difficult questions. I build with intent.";

interface IdentitySectionProps {
  scrollYProgress: MotionValue<number>;
}

interface IdentityLineProps {
  item: (typeof identityItems)[number];
  index: number;
  reducedMotion: boolean;
  scrollYProgress: MotionValue<number>;
}

function IdentityLine({
  item,
  index,
  reducedMotion,
  scrollYProgress,
}: IdentityLineProps) {
  const start = 0.72 + index * 0.045;
  const end = start + 0.08;
  const opacity = useTransform(scrollYProgress, [0, start, end, 1], [0, 0, 1, 1]);
  const y = useTransform(scrollYProgress, [0, start, end, 1], [34, 34, 0, 0]);

  return (
    <motion.li
      className="list-none text-[clamp(2.8rem,8vw,7.5rem)] font-light leading-none tracking-[0.18em] text-white/92"
      style={reducedMotion ? undefined : { opacity, y }}
    >
      <GradientText
        colors={["#FF9FFC", "#B19EEF", "#68fc51", "#ff00d1"]}
        animationSpeed={8}
        showBorder={false}
        className="!font-light"
      >
        {item}
      </GradientText>
    </motion.li>
  );
}

export default function IdentitySection({
  scrollYProgress,
}: IdentitySectionProps) {
  const reducedMotion = useReducedMotion();
  const introOpacity = useTransform(
    scrollYProgress,
    [0, 0.84, 0.9, 1],
    [0, 0, 1, 1]
  );
  const introY = useTransform(scrollYProgress, [0, 0.84, 0.9, 1], [26, 26, 0, 0]);

  return (
    <section className="pointer-events-none absolute inset-0 z-30 flex items-end justify-center px-6 pb-[16vh] sm:pb-[18vh]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 text-center">
        <ul className="space-y-4" aria-label="Identity statements">
          {identityItems.map((item, index) => (
            <IdentityLine
              key={item}
              index={index}
              item={item}
              reducedMotion={reducedMotion}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </ul>
        <motion.div
          className="pointer-events-auto mx-auto flex w-full max-w-[40rem] flex-col items-center gap-5 px-2"
          style={reducedMotion ? undefined : { opacity: introOpacity, y: introY }}
        >
          <p className="text-balance text-[0.98rem] font-light leading-[1.85] tracking-[0.04em] text-white/72 sm:text-[1.05rem]">
            {introCopy}
          </p>
          <button
            type="button"
            aria-label="builds"
            aria-disabled="true"
            className="group inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 bg-black/30 px-6 py-3 text-[0.68rem] uppercase tracking-[0.34em] text-white/88 backdrop-blur-sm transition duration-300 hover:border-white/28 hover:bg-black/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <span>builds</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
