import FAQ from "@/components/Home/FAQ";
import HomeCategories, {
  type HomeCategory,
} from "@/components/Home/HomeCategories";
import HomeCourseIntro from "@/components/Home/HomeCourseIntro";
import HomeFeatures from "@/components/Home/HomeFeatures";
import HomeSUbFAQ from "@/components/Home/HomeSubFAQ";
import LandingPage from "@/components/Home/LandingPage";
import JsonLd from "@/components/JsonLd";
import SubscriptionList from "@/components/SubscriptionList";
import { faqsByCategory } from "@/data/faq";
import {
  buildMetadata,
  dielineProductSchema,
  faqSchema,
  howToSchema,
  itemListSchema,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  webApplicationSchema,
} from "@/lib/seo";
import { prisma } from "@repo/db";
import type { Metadata } from "next";

/**
 * How many categories the home grid shows. The catalogue fills the featured slot
 * with the busiest category, so the number here is "how many extra cards".
 */
const HOME_CATEGORY_LIMIT = 5;

const page = async () => {
  const [tarrif, features, dieline, categoryCounts] = await Promise.all([
    prisma.tarrif.findMany({
      include: { price: true, fairDownload: true, features: true },
    }),
    prisma.tarrifFeature.findMany(),
    prisma.dieline.findFirst({
      where: { slug: "tuck-end" },
      include: {
        settings: true,
        dielineImage: true,
        modelImage: true,
        // The structured data names the categories the dieline belongs to.
        categoryByModel: true,
        categoryByUsage: true,
      },
    }),
    /**
     * Real category counts, so the grid links to pages that exist and the numbers
     * on the cards match what those pages show.
     */
    prisma.dielineCategoryByModel.findMany({
      where: { dieline: { some: { active: true } } },
      select: {
        title: true,
        slug: true,
        _count: { select: { dieline: { where: { active: true } } } },
      },
    }),
  ]);

  const categories: HomeCategory[] = categoryCounts
    .map((category) => ({
      title: category.title,
      slug: category.slug,
      count: category._count.dieline,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, HOME_CATEGORY_LIMIT);

  /**
   * The questions rendered on this page, and only those: FAQ rich results
   * require every marked-up question to be visible to the user on the same page.
   */
  const visibleFaqs = [
    ...faqsByCategory("product").slice(0, 5),
    ...faqsByCategory("subscription").slice(0, 5),
  ];

  /** Cheapest published price per period, in IRR, for the `Offer` catalogue. */
  const prices = tarrif.reduce<{
    monthly?: number;
    threeMonth?: number;
    annual?: number;
  }>((cheapest, plan) => {
    const price = plan.price;
    if (!price) return cheapest;

    const periods = [
      { key: "monthly", value: price.monthly },
      { key: "threeMonth", value: price.threeMonth },
      { key: "annual", value: price.annual },
    ] as const;

    for (const { key, value } of periods) {
      if (typeof value !== "number" || value <= 0) continue;
      const current = cheapest[key];
      if (current === undefined || value < current) cheapest[key] = value;
    }

    return cheapest;
  }, {});

  const structuredData = [
    webApplicationSchema({ prices }),
    howToSchema(),
    faqSchema(visibleFaqs, "/"),
    itemListSchema({
      name: "دسته‌بندی قالب‌های دایلاین",
      description: "دسته‌بندی قالب‌های بسته‌بندی بر اساس نوع جعبه.",
      path: "/",
      items: categories.map((category) => ({
        name: category.title,
        path: `/dielines/category/${category.slug}`,
      })),
    }),
    /**
     * The dieline the hero renders as a live example, described as a product so
     * the home page also carries a concrete, priceable entity.
     */
    ...(dieline
      ? [
          dielineProductSchema(dieline, {
            path: `/dieline/${dieline.slug}`,
            freeOffer: true,
          }),
        ]
      : []),
  ];

  return (
    <>
      <JsonLd data={structuredData} />

      <div className="space-y-48">
        <div className="mx-auto p-4 md:px-20 md:pt-20">
          <LandingPage dieline={dieline} />
        </div>

        <div className="mx-auto max-w-6xl p-4">
          <HomeFeatures />
        </div>

        <div className="border-y bg-muted/40 px-4 py-20 md:px-20 md:py-28">
          <HomeCategories categories={categories} />
        </div>

        <div className="space-y-10 p-4" id="subscription">
          <SubscriptionList tarrif={tarrif} features={features} />
        </div>

        <div className="mx-auto max-w-6xl p-4">
          <FAQ />
        </div>

        <div className="mx-auto max-w-6xl p-4">
          <HomeSUbFAQ />
        </div>

        <div className="mx-auto max-w-6xl p-4">
          <HomeCourseIntro />
        </div>
      </div>
    </>
  );
};

export default page;

/**
 * The home page metadata is the site's most important: it is what a search for
 * the brand, and a search for "طراحی دایلاین", is answered with.
 *
 * It is declared explicitly rather than inherited from the root layout so the
 * canonical is unambiguous and the title leads with the head term instead of the
 * brand. The `| پک‌ساز` suffix is appended by the template.
 */
export const metadata: Metadata = buildMetadata({
  title: "طراحی دایلاین بسته‌بندی آنلاین",
  /**
   * Brand first. A branded search is the query this site can win outright, and
   * Google appends or substitutes the site name itself — so the `<title>` leads
   * with "پک‌ساز" and spends the rest of its ~60 visible characters on the head
   * term rather than repeating the brand in the suffix as the template would.
   */
  absoluteTitle: "پک‌ساز | طراحی دایلاین بسته‌بندی آنلاین",
  description: SITE_DESCRIPTION,
  path: "/",
  keywords: [...SITE_KEYWORDS],
  image: {
    url: "/og-cover.png",
    width: 1200,
    height: 630,
    alt: `${SITE_NAME} — طراحی دایلاین بسته‌بندی`,
  },
});
