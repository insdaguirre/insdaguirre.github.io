import PillLink from "@/components/shared/PillLink";
import Waves from "@/components/shared/Waves";

const heroSignals = [
  "Founder-minded execution",
  "Product intuition shaped by users",
  "Systems built to scale with clarity",
] as const;

export default function AboutHero() {
  return (
    <section className="relative isolate flex min-h-[92svh] items-center overflow-hidden border-b border-white/8">
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.06),transparent_18%),radial-gradient(circle_at_22%_28%,rgba(82,39,255,0.105),transparent_18%),radial-gradient(circle_at_78%_32%,rgba(255,0,209,0.06),transparent_16%),linear-gradient(180deg,rgba(0,0,0,0.105),rgba(0,0,0,0.255)_44%,rgba(0,0,0,0.63)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_16%,transparent_84%,rgba(255,255,255,0.015))]" />
        <div className="absolute left-[10%] top-[18%] h-44 w-44 rounded-full bg-[#5227ff]/12 blur-[100px]" />
        <div className="absolute right-[14%] top-[24%] h-36 w-36 rounded-full bg-[#ff00d1]/8 blur-[90px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-12">
        <div className="max-w-4xl space-y-8">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[0.65rem] uppercase tracking-[0.34em] text-white/55 backdrop-blur-sm">
            About Me
          </div>
          <div className="space-y-6">
            <h1 className="max-w-5xl text-balance text-[clamp(3rem,8vw,6.6rem)] font-light uppercase leading-[0.92] tracking-[0.12em] text-white/94">
              Building products with intent, range, and real conviction.
            </h1>
            <p className="max-w-2xl text-pretty text-base leading-8 text-white/66 sm:text-lg">
              I operate at the intersection of product thinking, systems design,
              and founder-level execution. The work is deliberate: clear
              decisions, sharp interfaces, and products that stay close to the
              user.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <PillLink href="#about-body">Read More</PillLink>
            <PillLink href="/builds" variant="subtle">
              Explore Builds
            </PillLink>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {heroSignals.map((signal) => (
            <div
              key={signal}
              className="rounded-[1.6rem] border border-white/10 bg-black/35 px-5 py-5 backdrop-blur-sm"
            >
              <p className="text-sm uppercase tracking-[0.28em] text-white/62">
                {signal}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
