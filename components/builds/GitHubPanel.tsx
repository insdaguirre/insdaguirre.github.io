import PillLink from "@/components/shared/PillLink";

const githubSignals = [
  "Pinned repos and case-study links can live here.",
  "Recent activity or contributions can be layered in later.",
  "The shell stays compact so the page remains focused on the work.",
] as const;

export default function GitHubPanel() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(82,39,255,0.16),rgba(0,0,0,0.2)_38%,rgba(255,0,209,0.09)_100%)] p-6 sm:p-8">
        <div className="absolute inset-y-0 right-0 w-[40%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] lg:items-center">
          <div className="space-y-4">
            <p className="text-[0.7rem] uppercase tracking-[0.34em] text-white/44">
              GitHub Tie-In
            </p>
            <h2 className="max-w-2xl text-balance text-[clamp(1.8rem,3vw,3rem)] font-light leading-tight tracking-[0.08em] text-white/92">
              GitHub stays close to the work, without taking over the page.
            </h2>
            <p className="max-w-2xl text-pretty leading-7 text-white/62">
              This section is intentionally compact. It is ready to house
              repository highlights, contribution snapshots, or a lightweight
              activity feed when you want to wire it in.
            </p>
            <div className="flex flex-wrap gap-4">
              <PillLink href="https://github.com/insdaguirre" external>
                View GitHub
              </PillLink>
              <PillLink href="#projects" variant="subtle">
                Back to Builds
              </PillLink>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/35 p-5 backdrop-blur-sm">
            <p className="text-[0.68rem] uppercase tracking-[0.3em] text-white/40">
              Ready Shell
            </p>
            <div className="mt-5 space-y-4">
              {githubSignals.map((signal, index) => (
                <div
                  key={signal}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
                >
                  <p className="text-[0.64rem] uppercase tracking-[0.28em] text-white/36">
                    Slot 0{index + 1}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/62">
                    {signal}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
