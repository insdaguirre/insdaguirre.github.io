import AboutSignalBand from "@/components/about/AboutSignalBand";
import AboutBuildsTeaser from "@/components/about/AboutBuildsTeaser";
import ASCIIImageCarousel from "@/components/about/ASCIIImageCarousel";

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
    title: "Family",
    body: "I have a younger brother and sister, an Australian Shepherd named Zia, and a tortoiseshell cat named Ginger.",
  },
  {
    title: "Sidequests",
    body: "Skiing down sand-dunes, opening for Gunna & Flo-Rida, surfin' n sailin' the great-lakes, and running ultra-marathons.",
  },
  {
    title: "Hottest Takes",
    body: "Once Upon a Time in Hollywood is Tarantino's best film, and the best GUIs of this decade will be custom interfaces assembled live by AI.",
  },
] as const;

const aboutSignalImages = [
  "/about-intro/face.jpeg",
] as const;

const screenshotMeridiemSeparator = "\u202f";

const aboutSidequestImages = [
  `/about-sidequests-images/Screenshot 2026-05-12 at 12.55.55${screenshotMeridiemSeparator}PM.png`,
  `/about-sidequests-images/Screenshot 2026-05-12 at 12.57.46${screenshotMeridiemSeparator}PM.png`,
  `/about-sidequests-images/Screenshot 2026-05-12 at 12.58.07${screenshotMeridiemSeparator}PM.png`,
  `/about-sidequests-images/Screenshot 2026-05-12 at 12.59.07${screenshotMeridiemSeparator}PM.png`,
  `/about-sidequests-images/Screenshot 2026-05-12 at 12.59.32${screenshotMeridiemSeparator}PM.png`,
  `/about-sidequests-images/Screenshot 2026-05-12 at 1.01.00${screenshotMeridiemSeparator}PM.png`,
  `/about-sidequests-images/Screenshot 2026-05-12 at 1.01.28${screenshotMeridiemSeparator}PM.png`,
  `/about-sidequests-images/Screenshot 2026-05-12 at 1.01.35${screenshotMeridiemSeparator}PM.png`,
  `/about-sidequests-images/Screenshot 2026-05-12 at 1.01.52${screenshotMeridiemSeparator}PM.png`,
  `/about-sidequests-images/Screenshot 2026-05-12 at 1.05.43${screenshotMeridiemSeparator}PM.png`,
  `/about-sidequests-images/Screenshot 2026-05-12 at 1.06.45${screenshotMeridiemSeparator}PM.png`,
  `/about-sidequests-images/Screenshot 2026-05-12 at 1.07.25${screenshotMeridiemSeparator}PM.png`,
  `/about-sidequests-images/Screenshot 2026-05-12 at 1.09.42${screenshotMeridiemSeparator}PM.png`,
  `/about-sidequests-images/Screenshot 2026-05-12 at 1.14.17${screenshotMeridiemSeparator}PM.png`,
  `/about-sidequests-images/Screenshot 2026-05-12 at 1.28.32${screenshotMeridiemSeparator}PM.png`,
  `/about-sidequests-images/Screenshot 2026-05-12 at 1.36.55${screenshotMeridiemSeparator}PM.png`,
  `/about-sidequests-images/Screenshot 2026-05-12 at 1.38.11${screenshotMeridiemSeparator}PM.png`,
  `/about-sidequests-images/Screenshot 2026-05-12 at 1.40.39${screenshotMeridiemSeparator}PM.png`,
] as const;

export default function AboutContent() {
  return (
    <section
      id="about-body"
      className="relative z-10 py-12 sm:py-14 lg:py-16"
    >
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-12">
        <div className="grid items-stretch gap-6 lg:min-h-[42rem] lg:grid-cols-[minmax(22rem,0.82fr)_minmax(0,1.18fr)]">
          <aside className="relative min-h-[24rem] overflow-hidden rounded-[2rem] lg:h-full lg:min-h-[42rem]">
            <ASCIIImageCarousel
              images={aboutSignalImages}
              asciiFontSize={6}
              planeBaseHeight={24}
              enableWaves
              imageFit="cover"
              cycleIntervalMs={3200}
              flickerDurationMs={480}
              className="ascii-image-container relative h-full min-h-[24rem] w-full lg:min-h-[42rem]"
            />
          </aside>

          <section className="flex h-full min-h-[24rem] flex-col rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-md sm:p-8 lg:min-h-[42rem] lg:justify-between">
            <p className="text-[0.7rem] uppercase tracking-[0.34em] text-white/42">
              BETWEEN WORLDS
            </p>
            <h2 className="mt-4 max-w-2xl text-balance text-[clamp(2rem,4vw,3.6rem)] font-light leading-tight tracking-[0.08em] text-white/92">
              I build the bridge between technical systems and human needs.
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-white/66">
              <p>
                I am most energized by products that need both taste and
                discipline. The kind of work where product framing, software
                engineering judgment, and user empathy all have to meet in the
                same place.
              </p>
              <p>
                I have worked across AI Research, Software Engineering, & Product Design, and
                that range has shaped how I build. I care about clarity early,
                momentum during execution, and products that stay grounded in
                real user behavior.
              </p>
            </div>
          </section>
        </div>
      </div>

      <AboutSignalBand />

      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-12">
        <section className="rounded-[2rem] border border-white/10 bg-black/26 p-6 backdrop-blur-sm sm:p-8">
          <div className="max-w-2xl">
            <p className="text-[0.7rem] uppercase tracking-[0.34em] text-white/42">
              Values / Approach
            </p>
            <h2 className="mt-4 text-balance text-[clamp(1.9rem,3vw,3rem)] font-light leading-tight tracking-[0.08em] text-white/92">
              The product work I respect most is precise, useful, and difficult
              to fake.
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
                <p className="mt-4 text-sm leading-7 text-white/60">
                  {value.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <AboutBuildsTeaser />

      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-12">
        <section className="mt-6 grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)]">
          <div className="flex h-full flex-col rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 backdrop-blur-md sm:p-8">
            <p className="text-[0.7rem] uppercase tracking-[0.34em] text-white/42">
              Personal
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
                  <p className="mt-3 text-sm leading-7 text-white/60">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="relative min-h-[24rem] overflow-hidden rounded-[2rem] lg:h-full">
            <ASCIIImageCarousel
              images={aboutSidequestImages}
              asciiFontSize={6}
              planeBaseHeight={20}
              enableWaves
              imageFit="cover"
              cycleIntervalMs={3000}
              flickerDurationMs={460}
              className="ascii-image-container relative h-full min-h-[24rem] w-full"
            />
          </aside>
        </section>
      </div>
    </section>
  );
}
