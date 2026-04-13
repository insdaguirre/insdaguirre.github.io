import CurvedLoop from "@/components/about/CurvedLoop";
import Waves from "@/components/shared/Waves";
import { carouselItems } from "@/lib/carousel-items";

export default function AboutSignalBand() {
  return (
    <section className="relative my-12 overflow-hidden border-y border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] py-[clamp(4.75rem,10vw,8.5rem)] sm:my-16 lg:my-20">
      <div aria-hidden="true" className="absolute inset-0">
        <Waves
          lineColor="rgba(198,255,194,0.22)"
          backgroundColor="#040406"
          waveSpeedX={0.0125}
          waveSpeedY={0.01}
          waveAmpX={40}
          waveAmpY={20}
          friction={0.9}
          tension={0.01}
          maxCursorMove={120}
          xGap={12}
          yGap={36}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(255,255,255,0.07),transparent_18%),radial-gradient(circle_at_52%_48%,rgba(82,39,255,0.14),transparent_20%),radial-gradient(circle_at_84%_64%,rgba(255,0,209,0.09),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.045),transparent_26%,transparent_74%,rgba(255,255,255,0.035))]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_16%,transparent_84%,rgba(255,255,255,0.015))]" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/8" />
      </div>

      <div className="relative z-10">
        <CurvedLoop
          curveAmount={82}
          direction="left"
          interactive
          itemGap={36}
          itemHeight={96}
          itemWidth={152}
          items={carouselItems}
          speed={0.78}
        />
      </div>

      <p className="sr-only">
        AWS, CUDA, Dart, Express.js, Firebase, Flutter, Hugging Face, Java,
        JavaScript, MATLAB, MongoDB, Next.js, Node.js, PHP, PostgreSQL,
        Python, PyTorch, R, React, Redis, SQL, Stata, Swift, Tableau,
        TensorFlow, TypeScript, and vLLM.
      </p>
    </section>
  );
}
