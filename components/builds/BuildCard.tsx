import Link from "next/link";
import type { BuildProject } from "@/components/builds/types";

interface BuildCardProps {
  project: BuildProject;
  featured?: boolean;
}

function GitHubMarkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8a8.01 8.01 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.7 7.7 0 0 1 8 4.96c.68 0 1.36.09 2 .26 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </svg>
  );
}

export default function BuildCard({
  project,
  featured = false,
}: BuildCardProps) {
  const isClickable = Boolean(project.primaryLink);
  const statusToneClassName =
    project.statusTone === "validation"
      ? "border-amber-300/20 bg-amber-300/10 text-amber-100/90"
      : project.statusTone === "beta"
        ? "border-sky-300/20 bg-sky-300/10 text-sky-100/90"
        : project.statusTone === "live"
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200/90"
          : "border-white/12 bg-white/10 text-white/70";

  return (
    <article
      className={`group relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 transition duration-300 sm:p-7 ${
        isClickable
          ? "cursor-pointer hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.05]"
          : ""
      } ${
        featured ? "min-h-[22rem]" : "min-h-[19rem]"
      }`}
    >
      <div
        className={`absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,0,209,0.11),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(82,39,255,0.16),transparent_42%)] transition duration-500 ${
          isClickable ? "opacity-0 group-hover:opacity-100" : "opacity-0"
        }`}
      />
      <div className="relative flex h-full flex-col gap-6">
        {project.primaryLink ? (
          <Link
            href={project.primaryLink.href}
            target={project.primaryLink.external ? "_blank" : undefined}
            rel={project.primaryLink.external ? "noreferrer" : undefined}
            aria-label={project.primaryLink.ariaLabel ?? project.primaryLink.label}
            className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span className="sr-only">{project.primaryLink.label}</span>
          </Link>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="pointer-events-none flex items-center gap-3">
            <span className="text-[0.65rem] uppercase tracking-[0.3em] text-white/42">
              {project.label ?? project.id}
            </span>
            {project.status ? (
              <span
                className={`rounded-full border px-3 py-1 text-[0.62rem] uppercase tracking-[0.28em] ${statusToneClassName}`}
              >
                {project.status}
              </span>
            ) : null}
          </div>
          {project.secondaryLinks?.length ? (
            <div className="relative z-20 flex flex-wrap items-center gap-4 text-[0.68rem] uppercase tracking-[0.24em] text-white/56">
              {project.secondaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  aria-label={link.ariaLabel ?? link.label}
                  className={`rounded-full transition hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/45 focus-visible:text-white ${
                    link.icon ? "inline-flex h-7 w-7 items-center justify-center" : ""
                  }`}
                >
                  {link.icon === "github" ? (
                    <>
                      <span className="sr-only">{link.label}</span>
                      <GitHubMarkIcon className="h-4 w-4" />
                    </>
                  ) : (
                    link.label
                  )}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className="pointer-events-none space-y-4">
          <h3
            className={`max-w-3xl text-balance font-light tracking-[0.06em] text-white ${
              featured
                ? "text-[clamp(2rem,4vw,3.5rem)]"
                : "text-[clamp(1.5rem,2vw,2rem)]"
            }`}
          >
            {project.name}
          </h3>
          <p
            className={`max-w-2xl text-pretty leading-7 text-white/68 ${
              featured ? "text-base sm:text-lg" : "text-sm sm:text-base"
            }`}
          >
            {project.description}
          </p>
          {project.summary ? (
            <p className="max-w-xl text-sm leading-6 text-white/48">
              {project.summary}
            </p>
          ) : null}
        </div>

        <div className="pointer-events-none mt-auto flex flex-wrap gap-2 pt-4">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-black/35 px-3 py-2 text-[0.66rem] uppercase tracking-[0.24em] text-white/62"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
