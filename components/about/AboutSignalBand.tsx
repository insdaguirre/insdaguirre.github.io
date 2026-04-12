import CurvedLoop, { type CurvedLoopItem } from "@/components/about/CurvedLoop";
import Threads from "@/components/shared/Threads";

const stackSymbols: CurvedLoopItem[] = [
  { src: "/about-carousel/nextjs-icon-svgrepo-com.svg", alt: "Next.js" },
  { src: "/about-carousel/react-svgrepo-com.svg", alt: "React" },
  { src: "/about-carousel/typescript-svgrepo-com.svg", alt: "TypeScript" },
  { src: "/about-carousel/nodejs-icon-svgrepo-com.svg", alt: "Node.js" },
  { src: "/about-carousel/python-svgrepo-com.svg", alt: "Python" },
  { src: "/about-carousel/postgresql-logo-svgrepo-com.svg", alt: "PostgreSQL" },
  { src: "/about-carousel/aws-svgrepo-com.svg", alt: "AWS" },
  { src: "/about-carousel/firebase-icon.svg", alt: "Firebase" },
  { src: "/about-carousel/icon_flutter.svg", alt: "Flutter" },
];

export default function AboutSignalBand() {
  return (
    <section className="relative my-12 overflow-hidden border-y border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] py-[clamp(4.75rem,10vw,8.5rem)] sm:my-16 lg:my-20">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-0 opacity-[0.36] [mask-image:linear-gradient(to_bottom,transparent_0%,black_16%,black_84%,transparent_100%)]">
          <Threads
            amplitude={1}
            color={[1, 1, 1]}
            distance={0}
            enableMouseInteraction
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(255,255,255,0.07),transparent_18%),radial-gradient(circle_at_52%_48%,rgba(82,39,255,0.14),transparent_20%),radial-gradient(circle_at_84%_64%,rgba(255,0,209,0.09),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.045),transparent_26%,transparent_74%,rgba(255,255,255,0.035))]" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/8" />
      </div>

      <div className="relative z-10">
        <CurvedLoop
          curveAmount={82}
          direction="right"
          interactive
          itemGap={36}
          itemHeight={96}
          itemWidth={152}
          items={stackSymbols}
          speed={0.78}
        />
      </div>

      <p className="sr-only">
        Next.js, React, TypeScript, Node.js, Python, PostgreSQL, AWS,
        Firebase, and Flutter.
      </p>
    </section>
  );
}
