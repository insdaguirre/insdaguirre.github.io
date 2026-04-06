import Link from "next/link";

export interface BuildLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface BuildProject {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status?: string;
  label?: string;
  summary?: string;
  links?: BuildLink[];
}

interface BuildCardProps {
  project: BuildProject;
  featured?: boolean;
}

export default function BuildCard({
  project,
  featured = false,
}: BuildCardProps) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.05] sm:p-7 ${
        featured ? "min-h-[22rem]" : "min-h-[19rem]"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,0,209,0.11),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(82,39,255,0.16),transparent_42%)] opacity-0 transition duration-500 group-hover:opacity-100" />
      <div className="relative flex h-full flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[0.65rem] uppercase tracking-[0.3em] text-white/42">
              {project.label ?? project.id}
            </span>
            {project.status ? (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[0.62rem] uppercase tracking-[0.28em] text-emerald-200/90">
                {project.status}
              </span>
            ) : null}
          </div>
          {project.links?.length ? (
            <div className="flex flex-wrap items-center gap-4 text-[0.68rem] uppercase tracking-[0.24em] text-white/56">
              {project.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  className="transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
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

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
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
