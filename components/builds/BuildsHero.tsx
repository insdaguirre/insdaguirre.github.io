import Lightning from "@/components/shared/Lightning";
import PillLink from "@/components/shared/PillLink";

const heroSignals = [
  "0 to 1 product systems",
  "Operator-first UX",
  "Experiments built for signal",
] as const;

export default function BuildsHero() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden border-b border-white/8">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-0 bg-black">
          <Lightning
            className="h-full w-full"
            hue={266}
            xOffset={0}
            speed={0.5}
            intensity={0.9}
            size={0.95}
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.12),transparent_20%),radial-gradient(circle_at_18%_25%,rgba(82,39,255,0.12),transparent_18%),radial-gradient(circle_at_82%_30%,rgba(255,0,209,0.08),transparent_16%),linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.34)_45%,rgba(0,0,0,0.82)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.05),transparent_16%,transparent_82%,rgba(255,255,255,0.03))]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.82))]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-12">
        <div className="max-w-4xl space-y-8">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[0.65rem] uppercase tracking-[0.34em] text-white/55 backdrop-blur-sm">
            Selected Builds
          </div>
          <div className="space-y-6">
            <h1 className="max-w-5xl text-balance text-[clamp(3.2rem,9vw,7.2rem)] font-light uppercase leading-[0.92] tracking-[0.12em] text-white/94">
              Product systems built for velocity and signal.
            </h1>
            <p className="max-w-2xl text-pretty text-base leading-8 text-white/66 sm:text-lg">
              A tighter view into the products, experiments, and operational
              layers I ship. Clean systems, sharp interfaces, and execution that
              stays close to the user.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <PillLink href="#projects">Explore Builds</PillLink>
            <PillLink href="https://github.com/insdaguirre" external variant="subtle">
              GitHub
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
