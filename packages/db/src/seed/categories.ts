import { prisma } from "../lib/prisma";

/**
 * Catalogue categories, and which dielines belong to them. Categories are written
 * by slug, so running this again renames them; each dieline listed here gets
 * exactly these categories (its links are replaced), while dielines not listed
 * keep theirs. A slug that is not in the database is reported and skipped.
 *
 *     pnpm --filter @repo/db seed:categories
 */

/** By structure: how the box is built, what a die-maker would call it. */
const MODELS = {
  tuckEnd: "جعبه درب‌دار تاشو",
  lockBottom: "جعبه کف‌قفل",
  corrugated: "کارتن",
  mailer: "جعبه ارسال",
  drawer: "جعبه کشویی",
  handle: "جعبه دسته‌دار",
  window: "جعبه پنجره‌دار",
  card: "کارت",
  tag: "تگ آویز و برچسب",
  envelope: "پاکت",
  pillow: "جعبه بالشتی",
  sleeve: "روکش (اسلیو)",
} as const;

/** By use: what goes inside, which is how most customers look for a box. */
const USAGES = {
  cosmetics: "آرایشی و بهداشتی",
  pharma: "دارویی و مکمل",
  food: "مواد غذایی و شیرینی",
  ecommerce: "ارسال پستی و فروشگاه اینترنتی",
  gift: "هدیه و لوکس",
  apparel: "پوشاک و کفش",
  toys: "اسباب‌بازی و لوازم جانبی",
  shipping: "حمل و انبارداری",
  occasion: "مناسبتی",
} as const;

type Model = keyof typeof MODELS;
type Usage = keyof typeof USAGES;

// Uses follow each template's own description (what it says it is made for).
const LINKS: Record<string, { models: Model[]; usages: Usage[] }> = {
  "reverse-tuck-end": { models: ["tuckEnd"], usages: ["cosmetics", "pharma", "food"] },
  "tuck-end": { models: ["tuckEnd"], usages: ["cosmetics", "pharma"] },
  "straight-tuck-window": { models: ["tuckEnd", "window"], usages: ["toys", "cosmetics"] },
  "auto-lock-box": { models: ["lockBottom"], usages: ["food", "cosmetics"] },
  "gable-handle-box": { models: ["handle", "lockBottom"], usages: ["food", "gift", "occasion"] },
  "keyboard-box": { models: ["mailer", "corrugated"], usages: ["ecommerce", "apparel", "gift"] },
  "fefco-0201": { models: ["corrugated"], usages: ["shipping", "ecommerce"] },
  "postal-card": { models: ["card"], usages: ["occasion", "gift"] },
  "bevel-hang-tag": { models: ["tag"], usages: ["apparel", "gift"] },
  "heart-tag": { models: ["tag"], usages: ["gift", "occasion", "food"] },
  "flower-tag": { models: ["tag"], usages: ["gift", "toys", "occasion"] },
  "round-tag": { models: ["tag", "card"], usages: ["gift", "food", "cosmetics"] },
  "label-band": { models: ["tag"], usages: ["food", "cosmetics"] },
  "header-hang-tag": { models: ["tag"], usages: ["apparel", "toys"] },
  "greeting-card": { models: ["card"], usages: ["occasion", "gift"] },
  "snap-lock-box": { models: ["tuckEnd", "lockBottom"], usages: ["pharma", "cosmetics", "food"] },
  "carton-sleeve": { models: ["sleeve"], usages: ["gift", "food", "apparel"] },
  "tray-with-sleeve": { models: ["drawer", "sleeve"], usages: ["gift", "food", "apparel"] },
  "diamond-envelope": { models: ["envelope"], usages: ["occasion", "gift"] },
  "wallet-envelope": { models: ["envelope"], usages: ["ecommerce", "occasion"] },
  "pillow-box": { models: ["pillow"], usages: ["gift", "food", "cosmetics", "occasion"] },
};

/** URL slugs: kebab-case of the keys. */
const slug = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

async function main() {
  const modelIds = new Map<string, number>();
  for (const [key, title] of Object.entries(MODELS)) {
    const row = await prisma.dielineCategoryByModel.upsert({ where: { slug: slug(key) }, update: { title }, create: { title, slug: slug(key) } });
    modelIds.set(key, row.id);
  }
  const usageIds = new Map<string, number>();
  for (const [key, title] of Object.entries(USAGES)) {
    const row = await prisma.dielineCategoryByUsage.upsert({ where: { slug: slug(key) }, update: { title }, create: { title, slug: slug(key) } });
    usageIds.set(key, row.id);
  }

  for (const [dielineSlug, { models, usages }] of Object.entries(LINKS)) {
    const dieline = await prisma.dieline.findUnique({ where: { slug: dielineSlug } });
    if (!dieline) {
      console.log(`${dielineSlug}: not in the database, skipped`);
      continue;
    }
    await prisma.dieline.update({
      where: { id: dieline.id },
      data: {
        categoryByModel: { set: models.map((m) => ({ id: modelIds.get(m)! })) },
        categoryByUsage: { set: usages.map((u) => ({ id: usageIds.get(u)! })) },
      },
    });
    console.log(`${dielineSlug}: ${models.map((m) => MODELS[m]).join("، ")} | ${usages.map((u) => USAGES[u]).join("، ")}`);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
