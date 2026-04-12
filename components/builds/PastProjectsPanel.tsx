import ArchivedBuildsEntry from "@/components/builds/ArchivedBuildsEntry";
import {
  pastProjects,
  pastProjectsSectionCopy,
} from "@/components/builds/builds-content";

export default function PastProjectsPanel() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(82,39,255,0.16),rgba(0,0,0,0.2)_38%,rgba(255,0,209,0.09)_100%)] p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(82,39,255,0.14),transparent_36%)]" />
        <div className="relative space-y-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-[0.7rem] uppercase tracking-[0.34em] text-white/44">
              {pastProjectsSectionCopy.eyebrow}
            </p>
            <h2 className="text-balance text-[clamp(1.8rem,3vw,2.7rem)] font-light leading-tight tracking-[0.08em] text-white/92">
              {pastProjectsSectionCopy.heading}
            </h2>
            <p className="max-w-2xl text-pretty leading-7 text-white/62">
              {pastProjectsSectionCopy.description}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_32%),linear-gradient(135deg,rgba(82,39,255,0.08),transparent_45%,rgba(255,0,209,0.06)_100%)]" />
            <div className="relative flex items-center justify-between gap-4 border-b border-white/8 px-5 py-4 sm:px-6">
              <p className="text-[0.62rem] uppercase tracking-[0.3em] text-white/38">
                {pastProjects.length.toString().padStart(2, "0")} archived builds
              </p>
              <p className="hidden text-[0.62rem] uppercase tracking-[0.26em] text-white/32 sm:block">
                Click the computer to open the archive.
              </p>
            </div>
            <ArchivedBuildsEntry
              projects={pastProjects}
              fit={1.2}
              fitBasis="width"
              minRadius={560}
              maxRadius={1240}
              padFactor={0.05}
              maxVerticalRotationDeg={9}
              dragSensitivity={20}
              dragDampening={0.82}
              segments={21}
              overlayBlurColor="#080511"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
