import Link from "next/link";
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pastProjects.map((project, index) => (
              <Link
                key={project.href}
                href={project.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${project.name} on GitHub`}
                className="group relative flex min-h-[11rem] flex-col justify-between overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,0,209,0.12),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(82,39,255,0.16),transparent_40%)] opacity-0 transition duration-500 group-hover:opacity-100" />
                <div className="relative flex items-center justify-between gap-3">
                  <span className="text-[0.62rem] uppercase tracking-[0.3em] text-white/36">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[0.6rem] uppercase tracking-[0.26em] text-white/52">
                    GitHub
                  </span>
                </div>

                <div className="relative space-y-3">
                  <h3 className="text-[1.25rem] font-light tracking-[0.08em] text-white/90 sm:text-[1.35rem]">
                    {project.name}
                  </h3>
                  <p className="font-mono text-[0.7rem] leading-6 text-white/44 sm:text-[0.74rem]">
                    {project.repository}
                  </p>
                </div>

                <div className="relative flex items-center justify-between gap-3 text-[0.66rem] uppercase tracking-[0.26em] text-white/56 transition duration-300 group-hover:text-white/72">
                  <span>Open Repository</span>
                  <span aria-hidden="true">[&gt;]</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
