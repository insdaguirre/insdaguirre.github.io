const values = [
  {
    label: "01",
    title: "Clarity over noise",
    body: "I prefer sharp product framing, direct communication, and interfaces that reduce ambiguity instead of adding ceremony.",
  },
  {
    label: "02",
    title: "Speed with standards",
    body: "Fast execution matters, but only when the system underneath can support iteration, quality, and the next set of decisions.",
  },
  {
    label: "03",
    title: "Founder-level ownership",
    body: "I care about the whole surface area: product, narrative, technical choices, user trust, and what actually moves the business.",
  },
] as const;

const experience = [
  {
    title: "Product and systems thinking",
    body: "I work across product direction, UI architecture, interaction design, and implementation, keeping strategy close to execution.",
  },
  {
    title: "Operational product building",
    body: "I like building the layers behind the surface too: internal tooling, decision systems, workflows, and the connective tissue that keeps shipping coherent.",
  },
  {
    title: "User-centered rigor",
    body: "The work gets better when it stays grounded in behavior, not just taste. I pay attention to what users actually do and what the product is teaching them.",
  },
] as const;

const focusAreas = [
  "Products that turn complexity into a clear decision surface",
  "Interfaces that feel premium without becoming decorative",
  "Systems that can support both experimentation and scale",
  "Foundational work that compounds over time",
] as const;

export default function AboutContent() {
  return (
    <section
      id="about-body"
      className="relative z-10 mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 lg:px-12 lg:py-16"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-md sm:p-8">
          <p className="text-[0.7rem] uppercase tracking-[0.34em] text-white/42">
            Intro
          </p>
          <h2 className="mt-4 max-w-2xl text-balance text-[clamp(2rem,4vw,3.6rem)] font-light leading-tight tracking-[0.08em] text-white/92">
            A concise snapshot of how I think, build, and operate.
          </h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-white/66">
            <p>
              I am most energized by products that need both taste and
              discipline. The kind of work where strong framing, technical
              judgment, and user empathy all have to meet in the same place.
            </p>
            <p>
              This page is placeholder content for now, but the structure is
              designed to hold a sharper story later: background, principles,
              execution style, and the kinds of products I want to keep pushing
              forward.
            </p>
          </div>
        </section>

        <aside className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-sm sm:p-8">
          <p className="text-[0.7rem] uppercase tracking-[0.34em] text-white/42">
            Snapshot
          </p>
          <div className="mt-6 space-y-5">
            <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-[0.64rem] uppercase tracking-[0.3em] text-white/36">
                Role
              </p>
              <p className="mt-3 text-lg font-light tracking-[0.08em] text-white/88">
                Builder. Technologist. Founder.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-[0.64rem] uppercase tracking-[0.3em] text-white/36">
                Bias
              </p>
              <p className="mt-3 text-sm leading-6 text-white/62">
                Thoughtful speed, clean systems, and product choices that stay
                anchored to users.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-[0.64rem] uppercase tracking-[0.3em] text-white/36">
                Horizon
              </p>
              <p className="mt-3 text-sm leading-6 text-white/62">
                Products and operating layers that can compound into something
                durable.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-6 rounded-[2rem] border border-white/10 bg-black/26 p-6 backdrop-blur-sm sm:p-8">
        <div className="max-w-2xl">
          <p className="text-[0.7rem] uppercase tracking-[0.34em] text-white/42">
            Values / Approach
          </p>
          <h2 className="mt-4 text-balance text-[clamp(1.9rem,3vw,3rem)] font-light leading-tight tracking-[0.08em] text-white/92">
            The product work I respect most is precise, useful, and difficult to
            fake.
          </h2>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {values.map((value) => (
            <article
              key={value.title}
              className="rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-5"
            >
              <p className="text-[0.66rem] uppercase tracking-[0.28em] text-white/34">
                {value.label}
              </p>
              <h3 className="mt-4 text-xl font-light tracking-[0.06em] text-white/90">
                {value.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/60">{value.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)]">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 backdrop-blur-md sm:p-8">
          <p className="text-[0.7rem] uppercase tracking-[0.34em] text-white/42">
            Background / Experience
          </p>
          <div className="mt-6 space-y-5">
            {experience.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5"
              >
                <h3 className="text-lg font-light tracking-[0.06em] text-white/88">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/60">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-sm sm:p-8">
          <p className="text-[0.7rem] uppercase tracking-[0.34em] text-white/42">
            What I Care About Building
          </p>
          <ul className="mt-6 space-y-4">
            {focusAreas.map((item) => (
              <li
                key={item}
                className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-white/62"
              >
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(82,39,255,0.15),rgba(0,0,0,0.14)_45%,rgba(255,0,209,0.08)_100%)] p-5">
            <p className="text-[0.64rem] uppercase tracking-[0.28em] text-white/36">
              Placeholder Note
            </p>
            <p className="mt-3 text-sm leading-7 text-white/66">
              This module is intentionally easy to swap later for a more personal
              founder story, experience timeline, or philosophy section without
              changing the page system.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
