import ArchiveDomeGallery from "@/components/builds/ArchiveDomeGallery";
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

          <div className="relative isolate">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[8%] top-2 h-12 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.38),rgba(255,255,255,0.06)_58%,transparent_78%)] opacity-70 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[16%] -bottom-4 h-14 rounded-full bg-[radial-gradient(circle,rgba(255,154,76,0.26),rgba(255,154,76,0.08)_56%,transparent_76%)] opacity-80 blur-2xl"
            />

            <div className="relative overflow-hidden rounded-[2.7rem] border border-[#fff6f0]/14 bg-[linear-gradient(145deg,rgba(255,255,255,0.18),rgba(255,255,255,0.07)_30%,rgba(255,165,87,0.14)_100%)] p-[0.55rem] shadow-[0_30px_90px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.26),inset_0_-1px_0_rgba(255,153,72,0.16)] backdrop-blur-[18px] sm:rounded-[3.2rem] sm:p-[0.8rem] lg:p-[1rem]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[1px] rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0.04)_24%,rgba(255,150,70,0.12)_100%)]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-[8%] left-[0.45rem] w-[9%] rounded-full bg-[linear-gradient(180deg,rgba(255,176,103,0.4),rgba(255,255,255,0.05)_34%,rgba(255,146,63,0.18)_100%)] opacity-80 blur-[2px] sm:left-[0.7rem]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-[8%] right-[0.45rem] w-[9%] rounded-full bg-[linear-gradient(180deg,rgba(255,176,103,0.4),rgba(255,255,255,0.05)_34%,rgba(255,146,63,0.18)_100%)] opacity-80 blur-[2px] sm:right-[0.7rem]"
              />

              <div className="relative overflow-hidden rounded-[2.2rem] border border-white/30 bg-[linear-gradient(180deg,rgba(244,246,252,0.92),rgba(232,237,246,0.74)_38%,rgba(255,193,145,0.18)_100%)] px-3 pb-5 pt-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.62),inset_0_-18px_48px_rgba(255,148,64,0.08),0_18px_48px_rgba(0,0,0,0.22)] sm:rounded-[2.8rem] sm:px-4 sm:pb-6 sm:pt-5 lg:px-5 lg:pb-7">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-[4%] top-0 h-[18%] rounded-b-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0)_100%)] opacity-70"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-[18%] bottom-4 h-4 rounded-full bg-[linear-gradient(90deg,rgba(255,160,84,0.4),rgba(255,235,220,0.92)_44%,rgba(255,160,84,0.4))] opacity-70 blur-[0.5px] sm:bottom-5"
                />

                <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,16,34,0.98),rgba(11,6,21,0.98))] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_70px_rgba(5,2,12,0.36)] sm:rounded-[2.15rem]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_70%_120%,rgba(255,132,70,0.12),transparent_38%),linear-gradient(135deg,rgba(82,39,255,0.08),transparent_45%,rgba(255,0,209,0.05)_100%)]" />
                  <div className="relative flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
                    <p className="text-[0.62rem] uppercase tracking-[0.3em] text-white/46">
                      {pastProjects.length.toString().padStart(2, "0")} archived builds
                    </p>
                    <p className="hidden text-[0.62rem] uppercase tracking-[0.26em] text-white/36 sm:block">
                      Drag to orbit. Click a tile to focus.
                    </p>
                  </div>
                  <div className="relative h-[32rem] sm:h-[40rem] lg:h-[46rem]">
                    <ArchiveDomeGallery
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

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-[0.4rem] left-1/2 h-[0.95rem] w-[8.6rem] -translate-x-1/2 rounded-[999px] border border-[#ef9a58]/30 bg-[linear-gradient(180deg,rgba(255,214,184,0.96),rgba(249,145,60,0.88))] shadow-[0_8px_24px_rgba(214,105,13,0.26),inset_0_1px_0_rgba(255,255,255,0.56)] sm:bottom-[0.6rem] sm:h-[1rem] sm:w-[10rem]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
