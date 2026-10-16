import { absoluteUrl } from "@/lib/seo/site";
import { NON_SITEMAP_PATHS } from "@/lib/seo/routes";
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
 * Public pages that are not backed by a database row.
 *
 * `lastModified` is only set where there is a real timestamp to point at.
 * Claiming a page changed today on every request is the fastest way to teach a
 * crawler to ignore the signal.
 */
const PUBLIC_PAGES: {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/dielines", changeFrequency: "daily", priority: 0.9 },
  { path: "/subscription", changeFrequency: "weekly", priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact-us", changeFrequency: "monthly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
];

/**
 * Rendered per request rather than at build time: the sitemap then reflects the
 * current catalogue rather than the state at deploy time, and emitting it never
 * needs the database to be reachable during a build.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blocked = new Set<string>(NON_SITEMAP_PATHS);

  const staticPages: MetadataRoute.Sitemap = PUBLIC_PAGES.filter(
    (page) => !blocked.has(page.path),
  ).map((page) => ({
    url: absoluteUrl(page.path),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const [categoryPages, dielinePages] = await Promise.all([
    categoryEntries(),
    dielineEntries(),
  ]);

  return [...staticPages, ...categoryPages, ...dielinePages];
}

/**
 * One entry per category that actually contains a published dieline.
 *
 * Empty categories are dropped instead of advertised: sending a crawler to a
 * "no results" page is how a catalogue accumulates soft 404s.
 */
async function categoryEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const [byModel, byUsage] = await Promise.all([
      prisma.dielineCategoryByModel.findMany({
        where: { dieline: { some: { active: true } } },
        select: { slug: true, _count: { select: { dieline: true } } },
      }),
      prisma.dielineCategoryByUsage.findMany({
        where: { dieline: { some: { active: true } } },
        select: { slug: true, _count: { select: { dieline: true } } },
      }),
    ]);

    return [...byModel, ...byUsage]
      // A category with a single dieline is a thin page; it is still indexable
      // and linked from the catalogue, it just does not earn sitemap priority.
      .map((category) => ({
        url: absoluteUrl(`/dielines/category/${category.slug}`),
        changeFrequency: "weekly" as const,
        priority: category._count.dieline >= 3 ? 0.7 : 0.4,
      }));
  } catch (error) {
    console.error("sitemap: could not list categories", error);
    return [];
  }
}

/** One entry per published dieline, with its preview image. */
async function dielineEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const dielines = await prisma.dieline.findMany({
      where: { active: true },
      select: {
        slug: true,
        updatedAt: true,
        title: true,
        dielineImage: { select: { url: true } },
        modelImage: { select: { url: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return dielines.map((dieline) => ({
      url: absoluteUrl(`/dieline/${dieline.slug}`),
      lastModified: dieline.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      /**
       * Image entries feed Google Images, which is a real acquisition channel for
       * a product whose value is a picture of a box. The title is repeated as the
       * caption because that is what the on-page figure is labelled with.
       */
      images: [dieline.dielineImage?.url, dieline.modelImage?.url]
        .filter((url): url is string => Boolean(url))
        .map((url) => url),
    }));
  } catch (error) {
    // A sitemap is not worth failing a request over; fall back to the pages that
    // do not need the database.
    console.error("sitemap: could not list dielines", error);
    return [];
  }
}
