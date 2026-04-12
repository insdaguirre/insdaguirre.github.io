"use client";

import type { CSSProperties } from "react";
import LogoLoop, { type LogoItem } from "@/components/shared/LogoLoop";

const stackLogos: LogoItem[] = [
  {
    src: "/about-carousel/nextjs-icon-svgrepo-com.svg",
    alt: "Next.js",
    title: "Next.js",
    href: "https://nextjs.org",
  },
  {
    src: "/about-carousel/react-svgrepo-com.svg",
    alt: "React",
    title: "React",
    href: "https://react.dev",
  },
  {
    src: "/about-carousel/typescript-svgrepo-com.svg",
    alt: "TypeScript",
    title: "TypeScript",
    href: "https://www.typescriptlang.org",
  },
  {
    src: "/about-carousel/nodejs-icon-svgrepo-com.svg",
    alt: "Node.js",
    title: "Node.js",
    href: "https://nodejs.org",
  },
  {
    src: "/about-carousel/python-svgrepo-com.svg",
    alt: "Python",
    title: "Python",
    href: "https://www.python.org",
  },
  {
    src: "/about-carousel/postgresql-logo-svgrepo-com.svg",
    alt: "PostgreSQL",
    title: "PostgreSQL",
    href: "https://www.postgresql.org",
  },
  {
    src: "/about-carousel/aws-svgrepo-com.svg",
    alt: "AWS",
    title: "AWS",
    href: "https://aws.amazon.com",
  },
  {
    src: "/about-carousel/firebase-icon.svg",
    alt: "Firebase",
    title: "Firebase",
    href: "https://firebase.google.com",
  },
  {
    src: "/about-carousel/icon_flutter.svg",
    alt: "Flutter",
    title: "Flutter",
    href: "https://flutter.dev",
  },
];

const loopStyle = {
  "--logoloop-gap": "clamp(1rem, 2.8vw, 1.5rem)",
  "--logoloop-logoHeight": "clamp(1.85rem, 5vw, 2.65rem)",
} as CSSProperties;

export default function AboutStackBand() {
  return (
    <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] px-2 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:px-3 sm:py-5">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(82,39,255,0.18),transparent_22%),radial-gradient(circle_at_82%_64%,rgba(255,0,209,0.12),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_72%)]"
      />

      <div className="relative overflow-hidden">
        <LogoLoop
          logos={stackLogos}
          speed={42}
          hoverSpeed={14}
          gap={24}
          fadeOut
          fadeOutColor="#08080a"
          ariaLabel="Selected technologies across Diego Aguirre's product and engineering stack"
          className="about-stack-loop overflow-hidden"
          style={loopStyle}
          renderItem={(item) => {
            if (!("src" in item)) return null;

            return (
              <a
                href={item.href}
                aria-label={`Visit ${item.title ?? item.alt}`}
                target="_blank"
                rel="noreferrer noopener"
                className="about-stack-loop__item-link"
              >
                <span className="about-stack-loop__logo-frame">
                  <img
                    src={item.src}
                    alt=""
                    title={item.title}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="about-stack-loop__logo-image"
                    aria-hidden="true"
                  />
                </span>
              </a>
            );
          }}
        />
      </div>
    </section>
  );
}
