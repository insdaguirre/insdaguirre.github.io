import Link from "next/link";
import { buildProjects } from "@/components/builds/builds-content";
import { getBuildProjectPath } from "@/components/builds/builds-content";
import PillLink from "@/components/shared/PillLink";

const focusAreas = [
  {
    title: "AI Products",
    body: "User-facing products and internal tooling that turn noisy signals into clear decisions.",
  },
  {
    title: "Product Engineering",
    body: "Execution that connects product framing, technical judgment, and quality under real constraints.",
  },
  {
    title: "Founder Range",
    body: "Systems thinking that spans zero-to-one exploration, iteration loops, and long-term product credibility.",
  },
] as const;

const destinationCards = [
  {
    title: "Builds",
    href: "/builds/",
    body: "Current products, experiments, and archived public work.",
  },
  {
    title: "About",
    href: "/about/",
    body: "How I think, what I value, and the kind of work I want to compound.",
  },
] as const;

export default function HomeNarrativeSection() {
  return (
    <section
      id="overview"
      aria-labelledby="home-overview-heading"
      className="relative border-t border-white/8"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_18%_20%,rgba(82,39,255,0.18),transparent_22%),radial-gradient(circle_at_82%_26%,rgba(255,0,209,0.08),transparent_18%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.32)_24%,rgba(0,0,0,0.58)_100%)]"
      />
      <div className="relative mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-md sm:p-8">
            <p className="text-[0.7rem] uppercase tracking-[0.34em] text-white/42">
              Overview
            </p>
            <h2
              id="home-overview-heading"
              className="mt-4 max-w-3xl text-balance text-[clamp(2rem,4.2vw,3.7rem)] font-light leading-tight tracking-[0.08em] text-white/92"
            >
              Product-minded software engineer and founder building AI products,
              workflow systems, and decision surfaces.
            </h2>
            <div className="mt-6 max-w-3xl space-y-5 text-base leading-8 text-white/66">
              <p>
                I work where product thinking, software engineering, and
                founder-level ownership need to show up in the same place. The
                output is meant to be useful, legible, and durable.
              </p>
              <p>
                This site is the public layer of that work: current products,
                earlier experiments, and the thinking behind how I build.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <PillLink href="/builds/">Explore Builds</PillLink>
              <PillLink href="/about/" variant="subtle">
                About Diego
              </PillLink>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-sm sm:p-8">
            <p className="text-[0.7rem] uppercase tracking-[0.34em] text-white/42">
              What You&apos;ll Find Here
            </p>
            <div className="mt-6 grid gap-4">
              {destinationCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5 transition hover:border-white/16 hover:bg-white/[0.05]"
                >
                  <p className="text-[0.64rem] uppercase tracking-[0.3em] text-white/36">
                    Destination
                  </p>
                  <h3 className="mt-3 text-lg font-light tracking-[0.08em] text-white/88">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/62">
                    {card.body}
                  </p>
                </Link>
              ))}
            </div>
          </aside>
        </div>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-black/24 p-6 backdrop-blur-sm sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.34em] text-white/42">
                Focus Areas
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {focusAreas.map((area) => (
                  <article
                    key={area.title}
                    className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5"
                  >
                    <h3 className="text-lg font-light tracking-[0.06em] text-white/88">
                      {area.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-white/60">
                      {area.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.32)] sm:p-6">
              <p className="text-[0.7rem] uppercase tracking-[0.34em] text-white/42">
                Current Work
              </p>
              <div className="mt-5 space-y-4">
                {buildProjects.map((project) => (
                  <article
                    key={project.id}
                    className="rounded-[1.35rem] border border-white/8 bg-black/24 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-light tracking-[0.08em] text-white/88">
                        {project.name}
                      </h3>
                      {project.status ? (
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.62rem] uppercase tracking-[0.26em] text-white/54">
                          {project.status}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/62">
                      {project.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3 text-[0.68rem] uppercase tracking-[0.24em] text-white/56">
                      <Link
                        href={getBuildProjectPath(project.slug)}
                        className="transition hover:text-white"
                      >
                        Project Page
                      </Link>
                      {project.liveLink ? (
                        <Link
                          href={project.liveLink.href}
                          target={project.liveLink.external ? "_blank" : undefined}
                          rel={project.liveLink.external ? "noreferrer" : undefined}
                          className="transition hover:text-white"
                        >
                          {project.liveLink.label}
                        </Link>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </section>
  );
}
