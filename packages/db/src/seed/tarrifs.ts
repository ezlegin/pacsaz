import { prisma } from "../lib/prisma";
import type { PlanKey, TarrifFeatureType } from "../generated/prisma/client";

/**
 * Seeds demonstration data for the subscription plans (`Tarrif`) and everything the
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

/** The whole feature catalogue; every plan lists all of them, ticked or not. */
const FEATURES: FeatureSeed[] = [
  { title: "دسترسی به کتابخانه قالب‌ها", type: "general" },
  { title: "خروجی PDF با اندازه واقعی", type: "general" },
  { title: "خروجی DXF برای ایلاستریتور و اتوکد", type: "general" },
  { title: "ویرایشگر حرفه‌ای دایلاین", type: "general" },
  { title: "ذخیره‌سازی پروژه‌ها", type: "general" },
  { title: "پشتیبانی اختصاصی", type: "paid" },
  { title: "دایلاین اختصاصی و سفارشی", type: "paid" },
  { title: "مدیریت مشتریان و تاریخچه دانلود", type: "paid" },
];

const TARRIFS: TarrifSeed[] = [
  {
    key: "standard",
    title: "استاندارد",
    shortDescription: "برای شروع و پروژه‌های شخصی",
    description: "مناسب طراحان تازه‌کار و پروژه‌های کوچک",
    isRecommended: false,
    discountAmount: 0,
    price: { monthly: 299_000, threeMonth: 799_000, annual: 2_690_000 },
    fairDownload: { monthly: 5, threeMonth: 18, annual: 80 },
    features: [
      "دسترسی به کتابخانه قالب‌ها",
      "خروجی PDF با اندازه واقعی",
      "خروجی DXF برای ایلاستریتور و اتوکد",
    ],
  },
  {
    key: "pro",
    title: "حرفه‌ای",
    shortDescription: "پرفروش‌ترین انتخاب طراحان",
    description: "برای طراحان و استودیوهای فعال",
    isRecommended: true,
    discountAmount: 10,
    price: { monthly: 599_000, threeMonth: 1_590_000, annual: 5_390_000 },
    fairDownload: { monthly: 15, threeMonth: 50, annual: 240 },
    features: [
      "دسترسی به کتابخانه قالب‌ها",
      "خروجی PDF با اندازه واقعی",
      "خروجی DXF برای ایلاستریتور و اتوکد",
      "ویرایشگر حرفه‌ای دایلاین",
      "ذخیره‌سازی پروژه‌ها",
      "پشتیبانی اختصاصی",
    ],
  },
  {
    key: "organization",
    title: "سازمانی",
    shortDescription: "برای تیم‌ها و چاپخانه‌ها",
    description: "مناسب تیم‌ها، چاپخانه‌ها و کارخانه‌های بسته‌بندی",
    isRecommended: false,
    discountAmount: 20,
    price: { monthly: 1_290_000, threeMonth: 3_490_000, annual: 11_900_000 },
    fairDownload: { monthly: 40, threeMonth: 150, annual: 800 },
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
