import type { MetadataRoute } from "next";
import { buildProjects, getBuildProjectPath } from "@/components/builds/builds-content";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

const routes = [
  {
    path: "/",
    changeFrequency: "weekly" as const,
    priority: 1,
  },
  {
    path: "/about/",
    changeFrequency: "monthly" as const,
    priority: 0.8,
  },
  {
    path: "/builds/",
    changeFrequency: "weekly" as const,
    priority: 0.9,
  },
  ...buildProjects.map((project) => ({
    path: getBuildProjectPath(project.slug),
    changeFrequency: "monthly" as const,
    priority: 0.72,
  })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
