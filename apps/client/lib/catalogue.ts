import { getSessionUser } from "@repo/auth/session";
import { Prisma, prisma } from "@repo/db";
import { pagination } from "@repo/lib/utils/pagination";

/**
 * The catalogue query, shared by `/dielines` and `/dielines/category/<slug>`.
 *
 * Both routes render the same listing; keeping the fetch here is what stops the
 * two from drifting into different result sets, which is how a category page ends
 * up showing something the "all" page does not.
 */

export const PAGE_SIZE = 32;

/**
 * A dieline belongs to a category through either the model relation or the usage
 * relation, and the filter has to match both.
 */
export const categoryFilter = (slug: string): Prisma.DielineWhereInput => ({
  OR: [
    { categoryByModel: { some: { slug } } },
    { categoryByUsage: { some: { slug } } },
  ],
});

export type Catalogue = {
  dielines: Awaited<ReturnType<typeof fetchDielines>>;
  totalDielines: number;
  modelCategories: Awaited<ReturnType<typeof fetchCategories>>["byModel"];
  usageCategories: Awaited<ReturnType<typeof fetchCategories>>["byUsage"];
  favedIds: number[];
  /** The category the listing is currently constrained to, if any. */
  activeCategory: { title: string; slug: string } | null;
  /**
   * True when a `categorySlug` was requested that does not exist. The caller
   * turns that into a 404 rather than serving an empty 200 page, which search
   * engines record as a soft 404 and keep re-crawling.
   */
  missingCategory: boolean;
  /** The session user, already resolved for the favourite lookups. */
  user: Awaited<ReturnType<typeof getSessionUser>>;
  page: number;
};

async function fetchDielines(where: Prisma.DielineWhereInput, skip: number) {
  return prisma.dieline.findMany({
    orderBy: { id: "desc" },
    where,
    include: {
      dielineImage: true,
      modelImage: true,
      categoryByModel: true,
      categoryByUsage: true,
    },
    skip,
    take: PAGE_SIZE,
  });
}

async function fetchCategories() {
  const [byModel, byUsage] = await Promise.all([
    prisma.dielineCategoryByModel.findMany({
      include: { _count: { select: { dieline: { where: { active: true } } } } },
      orderBy: { title: "asc" },
    }),
    prisma.dielineCategoryByUsage.findMany({
      include: { _count: { select: { dieline: { where: { active: true } } } } },
      orderBy: { title: "asc" },
    }),
  ]);

  return { byModel, byUsage };
}

export async function getCatalogue({
  categorySlug,
  page,
}: {
  categorySlug?: string;
  page?: string;
}): Promise<Catalogue> {
  const { skip } = pagination(page ?? "", PAGE_SIZE);
  const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);

  /**
   * Without a `category` the OR clause matched nothing, so the plain catalogue
   * view returned an empty grid. Only constrain when filtering.
   */
  const where: Prisma.DielineWhereInput = {
    active: true,
    ...(categorySlug ? categoryFilter(categorySlug) : {}),
  };

  const user = await getSessionUser();

  const [dielines, totalDielines, categories, favedIds] = await Promise.all([
    fetchDielines(where, skip),
    prisma.dieline.count({ where }),
    fetchCategories(),
    user
      ? prisma.favedDieline.findMany({
          where: { userId: user.id },
          select: { dielineId: true },
        })
      : Promise.resolve([]),
  ]);

  // only offer categories that actually have something in them
  const modelCategories = categories.byModel.filter(
    (c) => c._count.dieline > 0,
  );
  const usageCategories = categories.byUsage.filter(
    (c) => c._count.dieline > 0,
  );

  const match = categorySlug
    ? [...categories.byModel, ...categories.byUsage].find(
        (c) => c.slug === categorySlug,
      )
    : undefined;

  return {
    dielines,
    totalDielines,
    modelCategories,
    usageCategories,
    favedIds: favedIds.map((f) => f.dielineId),
    activeCategory: match ? { title: match.title, slug: match.slug } : null,
    missingCategory: Boolean(categorySlug) && !match,
    user,
    page: currentPage,
  };
}
