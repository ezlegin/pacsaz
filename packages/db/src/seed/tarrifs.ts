import { prisma } from "../lib/prisma";
import type { PlanKey, TarrifFeatureType } from "../generated/prisma/client";

/**
 * Seeds the real data for the subscription plans (`Tarrif`) and everything the
 * pricing UI renders with them: `Price`, `FairDownload`, the shared `TarrifFeature`
 * catalogue and each plan's `SelectedTarrifFeature` rows.
 *
 * Safe to re-run: plans are matched by their unique `key` and updated in place, which
 * keeps the ids that existing `Payment` rows point at. Features are matched by title.
 */

type Periods = { monthly: number; threeMonth: number; annual: number };

type FeatureSeed = { title: string; type: TarrifFeatureType };

type TarrifSeed = {
  key: PlanKey;
  title: string;
  shortDescription: string;
  description: string;
  isRecommended: boolean;
  /** Percentage taken off by the UI, e.g. 10 = 10% off. */
  discountAmount: number;
  price: Periods;
  fairDownload: Periods;
  /** Titles from FEATURES that this plan includes. */
  features: string[];
};

/**
 * The whole feature catalogue; every plan lists all of them, ticked or not. Each
 * row is something the apps actually gate on the plan, so the pricing table never
 * promises more than the product does:
 * any plan removes the watermark and downloads (PDF, AI, DXF) within its quota;
 * `isPremium` (level > 1) unlocks saved copies and the customer list; pro and
 * organization unlock the customizer and the printed 3D preview (`canCustomize`).
 */
const FEATURES: FeatureSeed[] = [
  { title: "دسترسی به همه قالب‌ها در هر اندازه دلخواه", type: "general" },
  { title: "دانلود PDF، AI و DXF در اندازه واقعی", type: "general" },
  { title: "خطوط برش، تا و بلید در لایه‌های جدا", type: "general" },
  { title: "پیش‌نمایش سه‌بعدی و تخت بدون واترمارک", type: "general" },
  { title: "بررسی خودکار خطای دایلاین پیش از دانلود", type: "general" },
  { title: "ذخیره نسخه‌ها و دانلود دوباره", type: "paid" },
  { title: "ثبت مشتری و تاریخچه دانلود هر مشتری", type: "paid" },
  { title: "شخصی‌سازی قالب: پنجره، سوراخ، نوع لبه و گردی گوشه", type: "paid" },
  { title: "پیش‌نمایش سه‌بعدی با طرح چاپ", type: "paid" },
  { title: "پشتیبانی در اولویت", type: "paid" },
];

const BASE_FEATURES = FEATURES.filter((feature) => feature.type === "general").map((feature) => feature.title);

// Prices are in toman. Longer periods are already cheaper per month (about 15% for
// three months, 25% for a year), so `discountAmount` stays 0 rather than discounting twice.
const TARRIFS: TarrifSeed[] = [
  {
    key: "standard",
    title: "استاندارد",
    shortDescription: "برای طراحان مستقل و سفارش‌های گاه‌به‌گاه",
    description:
      "همه قالب‌ها را در اندازه دلخواه بسازید و فایل آماده قالب‌سازی بگیرید؛ مناسب طراحی که هر ماه چند جعبه طراحی می‌کند.",
    isRecommended: false,
    discountAmount: 0,
    price: { monthly: 390_000, threeMonth: 990_000, annual: 3_490_000 },
    fairDownload: { monthly: 10, threeMonth: 30, annual: 120 },
    features: BASE_FEATURES,
  },
  {
    key: "pro",
    title: "حرفه‌ای",
    shortDescription: "برای طراحان و استودیوهای بسته‌بندی",
    description:
      "قالب‌ها را برای هر مشتری شخصی‌سازی کنید، نسخه‌ها را ذخیره کنید و طرح چاپ را روی مدل سه‌بعدی ببینید.",
    isRecommended: true,
    discountAmount: 0,
    price: { monthly: 790_000, threeMonth: 1_990_000, annual: 6_990_000 },
    fairDownload: { monthly: 30, threeMonth: 100, annual: 400 },
    features: FEATURES.filter((feature) => feature.title !== "پشتیبانی در اولویت").map((feature) => feature.title),
  },
  {
    key: "organization",
    title: "سازمانی",
    shortDescription: "برای چاپخانه‌ها و تولیدکنندگان بسته‌بندی",
    description:
      "همه امکانات حرفه‌ای با سهمیه دانلود بالا و پشتیبانی در اولویت؛ مناسب چاپخانه و کارگاهی که هر روز دایلاین تحویل می‌دهد.",
    isRecommended: false,
    discountAmount: 0,
    price: { monthly: 1_890_000, threeMonth: 4_890_000, annual: 16_900_000 },
    fairDownload: { monthly: 100, threeMonth: 300, annual: 1_200 },
    features: FEATURES.map((feature) => feature.title),
  },
];

/** Levels are always derived from the key, exactly like the admin actions do. */
const LEVEL_BY_KEY: Record<PlanKey, number> = {
  standard: 1,
  pro: 2,
  organization: 3,
};

const main = async () => {
  const summary: { key: string; action: string; features: number }[] = [];

  await prisma.$transaction(async (tx) => {
    // 1. Feature catalogue: create what is missing, fix the type of what exists.
    const featureIdByTitle = new Map<string, number>();
    for (const feature of FEATURES) {
      const existing = await tx.tarrifFeature.findFirst({
        where: { title: feature.title },
      });

      if (existing) {
        if (existing.type !== feature.type) {
          await tx.tarrifFeature.update({
            where: { id: existing.id },
            data: { type: feature.type },
          });
        }
        featureIdByTitle.set(feature.title, existing.id);
      } else {
        const created = await tx.tarrifFeature.create({ data: feature });
        featureIdByTitle.set(feature.title, created.id);
      }
    }

    // 2. Plans: upsert by `key` so ids referenced by payments stay valid.
    for (const seed of TARRIFS) {
      const tarrifFeatureIds = seed.features.map((title) => {
        const id = featureIdByTitle.get(title);
        if (!id) throw new Error(`Unknown feature in seed: ${title}`);
        return id;
      });

      const base = {
        title: seed.title,
        shortDescription: seed.shortDescription,
        description: seed.description,
        isRecommended: seed.isRecommended,
        discountAmount: seed.discountAmount,
        level: LEVEL_BY_KEY[seed.key],
      };

      const existing = await tx.tarrif.findUnique({
        where: { key: seed.key },
        select: { id: true },
      });

      if (existing) {
        await tx.tarrif.update({
          where: { id: existing.id },
          data: {
            ...base,
            price: { upsert: { create: seed.price, update: seed.price } },
            fairDownload: {
              upsert: { create: seed.fairDownload, update: seed.fairDownload },
            },
            features: {
              deleteMany: {},
              createMany: {
                data: tarrifFeatureIds.map((tarrifFeatureId) => ({
                  tarrifFeatureId,
                })),
              },
            },
          },
        });
        summary.push({
          key: seed.key,
          action: `updated (id ${existing.id})`,
          features: tarrifFeatureIds.length,
        });
      } else {
        await tx.tarrif.create({
          data: {
            ...base,
            key: seed.key,
            price: { create: seed.price },
            fairDownload: { create: seed.fairDownload },
            features: {
              createMany: {
                data: tarrifFeatureIds.map((tarrifFeatureId) => ({
                  tarrifFeatureId,
                })),
              },
            },
          },
        });
        summary.push({
          key: seed.key,
          action: "created",
          features: tarrifFeatureIds.length,
        });
      }
    }

    // 3. Drop catalogue leftovers (e.g. the placeholder feature) so no plan shows
    //    a permanently unticked row. Selections cascade away with them.
    const stale = await tx.tarrifFeature.deleteMany({
      where: { title: { notIn: FEATURES.map((feature) => feature.title) } },
    });
    if (stale.count > 0) console.log(`Removed ${stale.count} stale feature(s).`);
  });

  const plans = await prisma.tarrif.findMany({
    orderBy: { level: "asc" },
    include: { price: true, fairDownload: true, features: true },
  });

  console.log("\nSeeded plans:");
  for (const plan of plans) {
    const action = summary.find((entry) => entry.key === plan.key)?.action ?? "?";
    console.log(
      `  ${plan.key.padEnd(13)} ${action.padEnd(16)} features=${plan.features.length} ` +
        `price=${plan.price?.monthly}/${plan.price?.threeMonth}/${plan.price?.annual} ` +
        `fair=${plan.fairDownload?.monthly}/${plan.fairDownload?.threeMonth}/${plan.fairDownload?.annual} ` +
        `recommended=${plan.isRecommended}`,
    );
  }

  const featureCount = await prisma.tarrifFeature.count();
  console.log(`\nFeature catalogue: ${featureCount} rows`);
};

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
