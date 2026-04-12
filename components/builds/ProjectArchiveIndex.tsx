import Link from "next/link";
import type { PastProject } from "@/components/builds/types";

interface ProjectArchiveIndexProps {
  projects: PastProject[];
}

export default function ProjectArchiveIndex({
  projects,
}: ProjectArchiveIndexProps) {
  return (
    <section
      aria-labelledby="archive-index-heading"
      className="border-t border-white/8 px-5 py-6 sm:px-6 sm:py-8"
    >
      <div className="max-w-3xl space-y-3">
        <p className="text-[0.64rem] uppercase tracking-[0.3em] text-white/36">
          Archive Index
        </p>
        <h3
          id="archive-index-heading"
          className="text-balance text-[clamp(1.45rem,2.3vw,2rem)] font-light tracking-[0.08em] text-white/90"
        >
          Fast scan of earlier public work for recruiters, founders, and
          technical visitors.
        </h3>
        <p className="text-sm leading-7 text-white/62">
          The interactive dome stays, but this index makes the archive easier to
          crawl, scan, and reference directly.
        </p>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <li key={project.name}>
            <article className="flex h-full flex-col justify-between rounded-[1.35rem] border border-white/8 bg-black/24 p-4">
              <div>
                <h4 className="text-base font-light tracking-[0.08em] text-white/88">
                  {project.name}
                </h4>
                <p className="mt-2 text-sm leading-6 text-white/48">
                  {project.repository}
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3 text-[0.68rem] uppercase tracking-[0.24em] text-white/56">
                <Link
                  href={project.href}
                  target={project.external ? "_blank" : undefined}
                  rel={project.external ? "noreferrer" : undefined}
                  className="transition hover:text-white"
                >
                  Repository
                </Link>
                {project.demoUrl ? (
                  <Link
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-white"
                  >
                    Demo
                  </Link>
                ) : null}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

