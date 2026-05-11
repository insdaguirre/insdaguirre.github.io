import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  buildProjects,
  getBuildProjectBySlug,
  getBuildProjectPath,
} from "@/components/builds/builds-content";
import ProjectDetailPage from "@/components/builds/ProjectDetailPage";
import MenuButton from "@/components/homepage/MenuButton";
import JsonLd from "@/components/seo/JsonLd";
import AmbientGridBackground from "@/components/shared/AmbientGridBackground";
import RevealFooterLayout from "@/components/shared/RevealFooterLayout";
import { createPageMetadata } from "@/lib/site";
import { createProjectPageSchema } from "@/lib/structured-data";

interface BuildProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return buildProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: BuildProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getBuildProjectBySlug(slug);

  if (!project) {
    return {};
  }

  return createPageMetadata({
    title: project.pageTitle,
    description: project.pageDescription,
    path: getBuildProjectPath(project.slug),
    socialImageOverride: {
      url: project.image.src,
      width: project.image.width,
      height: project.image.height,
      alt: project.imageAlt,
    },
  });
}

export default async function BuildProjectPage({
  params,
}: BuildProjectPageProps) {
  const { slug } = await params;
  const project = getBuildProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const relatedProjects = buildProjects.filter(
    (candidate) => candidate.slug !== project.slug
  );

  const externalLinks = [project.liveLink?.href, project.repositoryLink?.href].filter(
    (link): link is string => Boolean(link)
  );

  return (
    <>
      <JsonLd
        data={createProjectPageSchema({
          name: project.name,
          description: project.pageDescription,
          path: getBuildProjectPath(project.slug),
          productType: project.productType,
          tags: project.tags,
          status: project.status,
          externalLinks,
        })}
      />
      <RevealFooterLayout surfaceClassName="overflow-hidden">
        <MenuButton />
        <div className="relative">
          <AmbientGridBackground />
          <ProjectDetailPage project={project} relatedProjects={relatedProjects} />
        </div>
      </RevealFooterLayout>
    </>
  );
}