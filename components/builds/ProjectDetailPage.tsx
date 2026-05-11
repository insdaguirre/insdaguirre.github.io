import Image from "next/image";
import Link from "next/link";
import type { BuildProject } from "@/components/builds/types";
import PillLink from "@/components/shared/PillLink";
import { getBuildProjectPath } from "@/components/builds/builds-content";

interface ProjectDetailPageProps {
  project: BuildProject;
  relatedProjects: BuildProject[];
}

export default function ProjectDetailPage({
  project,
  relatedProjects,
}: ProjectDetailPageProps) {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-white/8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(82,39,255,0.18),transparent_20%),radial-gradient(circle_at_82%_26%,rgba(255,0,209,0.1),transparent_18%),linear-gradient(180deg,rgba(0,0,0,0.1),rgba(0,0,0,0.34)_42%,rgba(0,0,0,0.82)_100%)]" />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-6 pb-16 pt-20 sm:px-8 sm:pt-24 lg:px-12 lg:pb-20">
          <Link
            href="/builds/"
            className="mb-8 inline-flex w-fit items-center gap-2 text-[0.68rem] uppercase tracking-[0.32em] text-white/48 transition hover:text-white"
          >
            Back To Builds
          </Link>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(20rem,0.98fr)] lg:items-center">
            <div className="space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[0.65rem] uppercase tracking-[0.32em] text-white/55 backdrop-blur-sm">
                  {project.label}
                </span>
                {project.status ? (
                  <span className="rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-[0.65rem] uppercase tracking-[0.32em] text-white/72">
                    {project.status}
                  </span>
                ) : null}
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-balance text-[clamp(3rem,7vw,5.6rem)] font-light uppercase leading-[0.92] tracking-[0.12em] text-white/94">
                  {project.name}
                </h1>
                <p className="max-w-3xl text-pretty text-base leading-8 text-white/66 sm:text-lg">
                  {project.pageDescription}
                </p>
                {project.summary ? (
                  <p className="max-w-2xl text-sm leading-7 text-white/48 sm:text-base">
                    {project.summary}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                <PillLink href="/builds/">All Builds</PillLink>
                {project.liveLink ? (
                  <PillLink href={project.liveLink.href} external variant="subtle">
                    {project.liveLink.label}
                  </PillLink>
                ) : null}
                {project.repositoryLink ? (
                  <PillLink
                    href={project.repositoryLink.href}
                    external
                    variant="subtle"
                  >
                    {project.repositoryLink.label}
                  </PillLink>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Product", value: project.productType },
                  { label: "Role", value: project.role },
                  { label: "Stack", value: project.stackSummary },
                  { label: "Status", value: project.statusSummary },
                ].map((item) => (
                  <article
                    key={item.label}
                    className="rounded-[1.4rem] border border-white/10 bg-black/26 p-4 backdrop-blur-sm"
                  >
                    <p className="text-[0.62rem] uppercase tracking-[0.28em] text-white/36">
                      {item.label}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-white/72">
                      {item.value}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
              <div className="relative aspect-[16/10]">
                <Image
                  src={project.image}
                  alt={project.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 44rem, 100vw"
                  className="object-cover object-center"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,14,0.08),rgba(5,7,14,0.2)_58%,rgba(5,7,14,0.5)_100%)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_18%)]">
        <section className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="grid gap-4 lg:grid-cols-3">
            {project.detailSections.map((section) => (
              <article
                key={section.title}
                className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-sm"
              >
                <p className="text-[0.66rem] uppercase tracking-[0.3em] text-white/36">
                  {section.title}
                </p>
                <p className="mt-4 text-sm leading-7 text-white/66 sm:text-base">
                  {section.body}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]">
            <article className="rounded-[1.9rem] border border-white/10 bg-black/24 p-6 backdrop-blur-sm sm:p-8">
              <p className="text-[0.68rem] uppercase tracking-[0.32em] text-white/38">
                Route Context
              </p>
              <h2 className="mt-4 text-balance text-[clamp(1.7rem,3vw,2.4rem)] font-light tracking-[0.08em] text-white/90">
                Internal pathing for people who want signal, not just a screenshot.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/64 sm:text-base">
                This detail page sits between the broader builds index and the
                rest of the site so visitors can move from project proof to the
                wider operating context without leaving the site graph.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <PillLink href="/builds/">Back To Builds</PillLink>
                <PillLink href="/about/" variant="subtle">
                  About Diego
                </PillLink>
              </div>
            </article>

            <aside className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-8">
              <p className="text-[0.68rem] uppercase tracking-[0.32em] text-white/38">
                Link Surface
              </p>
              <div className="mt-5 space-y-3 text-sm leading-6 text-white/66">
                {project.liveLink ? (
                  <Link
                    href={project.liveLink.href}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-[1.2rem] border border-white/8 bg-black/24 px-4 py-3 transition hover:border-white/16 hover:text-white"
                  >
                    {project.liveLink.label}
                  </Link>
                ) : null}
                {project.repositoryLink ? (
                  <Link
                    href={project.repositoryLink.href}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-[1.2rem] border border-white/8 bg-black/24 px-4 py-3 transition hover:border-white/16 hover:text-white"
                  >
                    {project.repositoryLink.label}
                  </Link>
                ) : null}
                <Link
                  href="/builds/"
                  className="block rounded-[1.2rem] border border-white/8 bg-black/24 px-4 py-3 transition hover:border-white/16 hover:text-white"
                >
                  Explore the full builds archive
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-12 sm:px-8 lg:px-12 lg:pb-16">
          <div className="rounded-[2rem] border border-white/10 bg-black/24 p-6 backdrop-blur-sm sm:p-8">
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-white/38">
              Related Current Builds
            </p>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {relatedProjects.map((relatedProject) => (
                <Link
                  key={relatedProject.slug}
                  href={getBuildProjectPath(relatedProject.slug)}
                  className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 transition hover:border-white/16 hover:bg-white/[0.05]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-light tracking-[0.08em] text-white/90">
                      {relatedProject.name}
                    </h2>
                    {relatedProject.status ? (
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.62rem] uppercase tracking-[0.26em] text-white/54">
                        {relatedProject.status}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/62">
                    {relatedProject.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
