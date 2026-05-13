import ArchivedBuildsEntry from "@/components/builds/ArchivedBuildsEntry";
import { pastProjects } from "@/components/builds/builds-content";

export default function PastProjectsPanel() {
  return (
    <section
      aria-labelledby="archive-section-title"
      className="relative min-h-[100svh] overflow-hidden"
    >
      <h2 id="archive-section-title" className="sr-only">
        Archive
      </h2>
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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px bg-white/18"
      />
    </section>
  );
}
