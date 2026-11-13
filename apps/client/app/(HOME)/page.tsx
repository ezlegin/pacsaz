import { HomeBoxProvider, type BoxRange, type HomeBoxInitial } from "@/components/Home/HomeBoxProvider";
import { BoxGallery, Course, Faq, FinalCta, Production, Steps, type BoxFamilyItem } from "@/components/Home/HomeSections";
import Showcase from "@/components/Home/Showcase";
import JsonLd from "@/components/JsonLd";
import SubscriptionList from "@/components/SubscriptionList";
import { faqsByCategory } from "@/data/faq";
import { loadTemplate } from "@/lib/dieline/engine";
import { buildDrawing, buildFoldSvg, buildPreviewSvg, presetDocument, unionBounds, viewBoxOf, type BoxInputs, type BoxSize } from "@/lib/dieline/homeBox";
import {
  buildMetadata,
  dielineSchema,
  faqSchema,
  howToSchema,
  itemListSchema,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  webApplicationSchema,
} from "@/lib/seo";
import { prisma } from "@repo/db";
import { materials } from "@repo/dieline-core/data/materials";
import type { DimensionType, PresetId } from "@repo/dieline-engine";
import type { Metadata } from "next";

/** The template the hero opens, and the box it starts from if that is missing. */
const HERO_SLUG = "tuck-end";
const FALLBACK = { width: 60, length: 100, height: 160, bleed: 3 };

/** One white board and one flute: enough to see thickness change the drawing. */
const HERO_MATERIALS = ["glossyCardboard", "fFlute"];

/**
 * The body types the editor builds (`PresetId`), shown as the home page's
 * categories. `slug` is the catalogue template built on that body, when there is one.
 */
/**
 * Sizes the body types are drawn at, where the carton default does not suit:
 * the keyboard box is measured from a wide, shallow die on 3 mm board, and
 * corrugated cartons are thick board too.
 */
const FAMILY_SIZE: Partial<Record<PresetId, Partial<BoxInputs>>> = {
  keyboardBox: { size: { width: 315, length: 202, height: 62 }, thickness: 3 },
  fefco0201: { thickness: 3 },
};

const BOX_FAMILY: { id: PresetId; title: string; latin: string; slug?: string }[] = [
  { id: "straightTuckEnd", title: "درب هم‌جهت", latin: "Straight Tuck End", slug: "tuck-end" },
  { id: "reverseTuckEnd", title: "درب معکوس", latin: "Reverse Tuck End", slug: "reverse-tuck-end" },
  { id: "autoLockBottom", title: "کف اتوماتیک", latin: "Auto-Lock Bottom", slug: "auto-lock-box" },
  { id: "snapLockBottom", title: "کف قفلی", latin: "Snap Lock Bottom" },
  { id: "keyboardBox", title: "جعبه کیبوردی", latin: "Keyboard Box", slug: "keyboard-box" },
  { id: "gableHandle", title: "دسته‌دار شیروانی", latin: "Gable Handle", slug: "gable-handle-box" },
  { id: "sleeve", title: "روکش کشویی", latin: "Sleeve" },
  { id: "fefco0201", title: "کارتن استاندارد", latin: "FEFCO 0201" },
];

/** A hero slider's range: around the default, never beyond what the template sells. */
const rangeOf = (value: number, min: number, max: number) => ({
  min: Math.max(min, Math.ceil(value * 0.6)),
  max: Math.min(max > 0 ? max : Infinity, Math.floor(value * 1.2)),
});

const page = async () => {
  const [tarrif, features, dieline, live] = await Promise.all([
    prisma.tarrif.findMany({
      include: { price: true, fairDownload: true, features: true },
    }),
    prisma.tarrifFeature.findMany(),
    prisma.dieline.findFirst({
      where: { slug: HERO_SLUG },
      include: {
        settings: true,
        dielineImage: true,
        modelImage: true,
        // The structured data names the categories the dieline belongs to.
        categoryByModel: true,
        categoryByUsage: true,
      },
    }),
    // Which body types have a live template to open.
    prisma.dieline.findMany({ where: { active: true, slug: { in: BOX_FAMILY.flatMap((item) => item.slug ?? []) } }, select: { slug: true } }),
  ]);

  /**
   * The hero draws the real template, so what it shows is what the product page
   * opens. Everything below it draws engine presets, which need no database: the
   * page must stay whole on an empty catalogue.
   */
  const template = dieline ? loadTemplate(dieline.specification) : null;
  const doc = template ?? presetDocument("reverseTuckEnd");
  const usable = template && dieline?.settings ? dieline : null;
  const settings = usable?.settings;

  const size: BoxSize = {
    width: settings?.width ?? FALLBACK.width,
    length: settings?.length ?? FALLBACK.length,
    height: settings?.height ?? FALLBACK.height,
  };
  const range: BoxRange = {
    width: rangeOf(size.width, usable?.minWidth ?? 1, usable?.maxWidth ?? 0),
    length: rangeOf(size.length, usable?.minLength ?? 1, usable?.maxLength ?? 0),
    height: rangeOf(size.height, usable?.minHeight ?? 1, usable?.maxHeight ?? 0),
  };

  // A fixed pair, white board and the thinnest flute, whatever the template sells:
  // the hero shows thickness at work, and the product page clamps the material.
  const heroMaterials = HERO_MATERIALS
    .map((value) => materials.find((item) => item.value === value))
    .filter((item) => item !== undefined)
    .slice(0, 2)
    .map(({ value, label, thickness }) => ({ value, label, thickness }));
  const firstMaterial = heroMaterials[0] ?? { value: "glossyCardboard", label: "مقوا گلاسه", thickness: 0.5 };

  const dimensionType = (settings?.dimensionType ?? "manufacture") as DimensionType;
  const inputs: BoxInputs = { size, dimensionType, thickness: firstMaterial.thickness, bleed: settings?.bleed ?? FALLBACK.bleed };

  const drawing = buildDrawing(doc, inputs);
  const biggest = buildDrawing(doc, {
    ...inputs,
    thickness: Math.max(firstMaterial.thickness, ...heroMaterials.map((item) => item.thickness)),
    size: { width: range.width.max, length: range.length.max, height: range.height.max },
  });

  const initial: HomeBoxInitial = {
    doc,
    slug: HERO_SLUG,
    title: dieline?.title ?? "جعبه درب‌دار",
    dimensionType,
    bleed: inputs.bleed,
    foldConfig: template?.folds ? JSON.stringify({ version: 1, ...template.folds }) : null,
    size,
    range,
    materials: heroMaterials.length ? heroMaterials : [firstMaterial],
    drawing,
    foldSvg: buildFoldSvg(doc, inputs),
    preview: buildPreviewSvg(doc, inputs),
    viewBox: viewBoxOf(unionBounds([drawing, biggest]), 6),
  };

  const familyInputs: BoxInputs = { size: { width: 60, length: 100, height: 150 }, dimensionType: "manufacture", thickness: 0.5, bleed: 3 };
  const opens = new Set(live.map((row) => row.slug));
  const family: BoxFamilyItem[] = BOX_FAMILY.map(({ slug, ...item }) => ({
    ...item,
    href: slug && opens.has(slug) ? `/dieline/${slug}` : "/dielines",
    drawing: buildDrawing(presetDocument(item.id), { ...familyInputs, ...FAMILY_SIZE[item.id] }),
  }));

  /** One preset at growing sizes: the picture of what "parametric" means. */
  const sizes = [0.5, 0.65, 0.8, 1, 1.25, 1.55].map((scale) =>
    buildDrawing(presetDocument("reverseTuckEnd"), {
      ...familyInputs,
      size: { width: 60 * scale, length: 100 * scale, height: 150 * scale },
    }),
  );

  /**
   * The questions rendered on this page, and only those: FAQ rich results
   * require every marked-up question to be visible to the user on the same page.
   */
  const productFaqs = faqsByCategory("product").slice(0, 5);
  const subscriptionFaqs = faqsByCategory("subscription").slice(0, 5);

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
    faqSchema([...productFaqs, ...subscriptionFaqs], "/"),
    itemListSchema({
      name: "ساختارهای پایه‌ی جعبه",
      description: "ساختارهای رایج جعبه و کارتن که در این صفحه معرفی شده‌اند.",
      path: "/",
      items: BOX_FAMILY.map((item) => ({ name: item.title, path: `/#${item.id}` })),
    }),
    /**
     * The dieline the hero renders as a live example, so the home page also
     * carries a concrete entity.
     */
    ...(dieline
      ? [
          dielineSchema(dieline, { path: `/dieline/${dieline.slug}` }),
        ]
      : []),
  ];

  return (
    <div className="home">
      <JsonLd data={structuredData} />

      <HomeBoxProvider initial={initial}>
        <Showcase />
      </HomeBoxProvider>

      <BoxGallery items={family} />
      <Steps />
      <Production sizes={sizes} />

      <div className="paper">
        <section id="subscription" aria-label="اشتراک پک‌ساز" className="scroll-mt-20 pt-24 md:pt-32">
          <SubscriptionList tarrif={tarrif} features={features} />
        </section>
        <Faq product={productFaqs} subscription={subscriptionFaqs} />
        <Course />
      </div>

      <FinalCta sizes={sizes.slice(2)} slug={HERO_SLUG} />
    </div>
  );
};

export default page;

/**
 * The home page metadata is the site's most important: it is what a search for
 * the brand, and a search for "طراحی دایلاین", is answered with.
 *
 * It is declared explicitly rather than inherited from the root layout so the
 * canonical is unambiguous and the title leads with the head term instead of the
 * brand.
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
