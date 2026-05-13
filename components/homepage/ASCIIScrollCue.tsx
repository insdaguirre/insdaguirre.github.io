"use client";

import { useEffect, useState } from "react";
import ASCIIText from "@/components/homepage/ASCIIText";

export default function ASCIIScrollCue() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (window.scrollY > 0) {
      setHasScrolled(true);
      return;
    }

    const hideScrollCue = () => {
      setHasScrolled(true);
      window.removeEventListener("scroll", hideScrollCue);
      window.removeEventListener("wheel", hideScrollCue);
      window.removeEventListener("touchmove", hideScrollCue);
    };

    window.addEventListener("scroll", hideScrollCue, { passive: true });
    window.addEventListener("wheel", hideScrollCue, { passive: true });
    window.addEventListener("touchmove", hideScrollCue, { passive: true });

    return () => {
      window.removeEventListener("scroll", hideScrollCue);
      window.removeEventListener("wheel", hideScrollCue);
      window.removeEventListener("touchmove", hideScrollCue);
    };
  }, []);

  if (hasScrolled) {
    return null;
  }

  return (
    <div
      className="ascii-scroll-cue"
      data-visible={isVisible}
      aria-label="Scroll down"
    >
      <span className="sr-only">Scroll down</span>
      <div aria-hidden="true" className="ascii-scroll-cue__stage">
        <ASCIIText
          text="↓"
          textColor="#fdf9f3"
          enableWaves
          waveStrength={1}
        />
      </div>
    </div>
  );
}
