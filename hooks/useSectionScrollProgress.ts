"use client";

import type { RefObject } from "react";
import { useEffect } from "react";
import { useMotionValue, useMotionValueEvent, useScroll } from "framer-motion";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function useSectionScrollProgress(
  ref: RefObject<HTMLElement | null>
) {
  const { scrollY } = useScroll();
  const progress = useMotionValue(0);

  useEffect(() => {
    function update(latest: number) {
      if (!ref.current || typeof window === "undefined") {
        return;
      }

      const rect = ref.current.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const maxScroll =
        sectionTop + ref.current.offsetHeight - window.innerHeight;
      const range = maxScroll - sectionTop;

      if (range <= 0) {
        progress.set(0);
        return;
      }

      progress.set(clamp((latest - sectionTop) / range, 0, 1));
    }

    update(scrollY.get());

    function handleResize() {
      update(scrollY.get());
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [progress, ref, scrollY]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!ref.current || typeof window === "undefined") {
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const maxScroll = sectionTop + ref.current.offsetHeight - window.innerHeight;
    const range = maxScroll - sectionTop;

    if (range <= 0) {
      progress.set(0);
      return;
    }

    progress.set(clamp((latest - sectionTop) / range, 0, 1));
  });

  return progress;
}
