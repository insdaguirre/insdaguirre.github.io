import BuildCard from "@/components/builds/BuildCard";
import RecentWorkSignalCard from "@/components/builds/RecentWorkSignalCard";
import {
  buildProjects,
  buildsShowcaseCopy,
  recentWorkSignals,
} from "@/components/builds/builds-content";

export default function BuildsShowcase() {
  const [featuredProject, ...secondaryProjects] = buildProjects;

  return (
    <section
      id="projects"
      className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-8 pt-12 sm:px-8 lg:px-12 lg:pb-10 lg:pt-16"
    >
      <div className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="border-b border-white/8 px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="max-w-5xl space-y-8 lg:space-y-10">
            <div className="space-y-5">
              <p className="text-[0.7rem] uppercase tracking-[0.34em] text-white/44">
                {buildsShowcaseCopy.eyebrow}
              </p>
              <h2 className="max-w-4xl text-balance text-[clamp(2.15rem,4.3vw,4rem)] font-light leading-[1.02] tracking-[0.07em] text-white/92">
                {buildsShowcaseCopy.heading}
              </h2>
              <p className="max-w-3xl text-pretty text-base leading-7 text-white/62 sm:text-lg">
                {buildsShowcaseCopy.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {recentWorkSignals.map((signal) => (
                <RecentWorkSignalCard key={signal.title} signal={signal} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5 px-6 py-6 sm:px-8 sm:py-8 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-12">
            <BuildCard project={featuredProject} featured />
          </div>
          {secondaryProjects.map((project) => (
            <div key={project.id} className="lg:col-span-6 lg:h-full">
              <BuildCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
