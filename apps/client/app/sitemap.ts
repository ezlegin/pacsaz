import { prisma } from "@repo/db";
import type { MetadataRoute } from "next";

const url = process.env.NEXT_PUBLIC_MAIN_URL || "https://pacsaz.ir";
export const dynamic = "force-dynamic";

type ChangeFreq =
  | "daily"
  | "yearly"
  | "monthly"
  | "weekly"
  | "always"
  | "hourly"
  | "never"
  | undefined;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  //! 0) Home Route
  const homePath = {
    url,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as ChangeFreq,
    priority: 1.0,
  };

  //! 1) Static routes
  const staticRoutes = ["/about-us", "/contact-us", "/terms"];
  const staticPaths = staticRoutes.map((path) => ({
    url: `${url + path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "yearly" as ChangeFreq,
    priority: 0.5,
  }));

  //! 2) Dielines (only published)
  const dielines = await prisma.dieline.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
  });
  const dielinesPaths = dielines.map(({ slug, updatedAt }) => ({
    url: `${url}/dieline/${encodeURIComponent(slug)}`,
    lastModified: updatedAt.toISOString(),
    changeFrequency: "monthly" as ChangeFreq,
    priority: 0.8,
  }));

  return [homePath, ...dielinesPaths, ...staticPaths];
}
