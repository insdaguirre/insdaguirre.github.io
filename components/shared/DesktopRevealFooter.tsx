"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";
import { useScroll } from "framer-motion";
import FooterCarStage from "@/components/shared/FooterCarStage";
import FooterContent from "@/components/shared/FooterContent";

const FOOTER_REVEAL_HEIGHT = "65vh";
const FOOTER_CONTENT_HEIGHT = "14rem";

interface DesktopRevealFooterProps {
  children: ReactNode;
  surfaceClassName?: string;
}

export default function DesktopRevealFooter({
  children,
  surfaceClassName = "",
}: DesktopRevealFooterProps) {
  const runwayRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ["start end", "end end"],
  });

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-0 hidden lg:block">
        <footer
          style={
            {
              height: FOOTER_REVEAL_HEIGHT,
              "--footer-reveal-height": FOOTER_REVEAL_HEIGHT,
              "--footer-content-height": FOOTER_CONTENT_HEIGHT,
            } as CSSProperties
          }
          className="pointer-events-auto relative overflow-hidden border-t border-white/10 bg-black/60 backdrop-blur-sm"
        >
          <FooterCarStage revealProgress={scrollYProgress} />

          <div className="relative z-10 flex h-full flex-col justify-end">
            <FooterContent className="min-h-[var(--footer-content-height)] items-center" />
          </div>
        </footer>
      </div>

      <div
        className={`relative z-10 bg-black shadow-[0_28px_90px_rgba(0,0,0,0.6)] ${surfaceClassName}`.trim()}
      >
        {children}
      </div>

      <div
        aria-hidden="true"
        ref={runwayRef}
        className="hidden lg:block"
        style={{ height: FOOTER_REVEAL_HEIGHT }}
      />
    </>
  );
}
