import { siteUrl } from "@/lib/consts";
import { privateRoutes } from "@/proxy";
import { prisma } from "@repo/db";
import type { MetadataRoute } from "next";

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

/**
 * Public pages that are not backed by a database row. Everything a session is
 * required for is filtered out below using `privateRoutes` — the same list
 * robots.txt uses — plus the login and onboarding routes.
 */
const PUBLIC_PAGES: {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/dielines", changeFrequency: "daily", priority: 0.9 },
  { path: "/subscription", changeFrequency: "weekly", priority: 0.6 },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact-us", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

const AUTH_ROUTES = ["/login", "/onboarding"];

const isPrivate = (path: string) =>
  [...privateRoutes, ...AUTH_ROUTES].some(
    (route) => path === route || path.startsWith(`${route}/`),
  );

// Rendered per request instead of at build time: the sitemap then reflects the
// current catalog rather than the state at deploy time, and emitting it never
// needs the database to be reachable during a build.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = PUBLIC_PAGES.filter(
    (page) => !isPrivate(page.path),
  ).map((page) => ({
    url: `${siteUrl}${page.path === "/" ? "" : page.path}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  return [...staticPages, ...(await dielinePages())];
}

/** One entry per published dieline. */
async function dielinePages(): Promise<MetadataRoute.Sitemap> {
  try {
    const dielines = await prisma.dieline.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    return dielines
      .filter((dieline) => !isPrivate(`/dieline/${dieline.slug}`))
      .map((dieline) => ({
        url: `${siteUrl}/dieline/${dieline.slug}`,
        lastModified: dieline.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch (error) {
    // A sitemap is not worth failing a request over; fall back to the pages that
    // do not need the database.
    console.error("sitemap: could not list dielines", error);
    return [];
  }
}
