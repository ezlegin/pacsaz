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
 * The whole feature catalogue. A pricing card lists what its plan adds to the
 * plan below it, so every higher plan must hold all of the lower plan's. Each
 * row is something the apps actually gate on the plan, so the pricing table never
 * promises more than the product does:
 * any plan removes the watermark, lets the customer lay an image over the dieline and downloads (PDF, AI, DXF) within its quota;
 * `isPremium` (level > 1) unlocks saved copies and the customer list; pro and
 * organization unlock the customizer (`canCustomize`). Artwork on the dieline
 * and the 3D model is in every paid plan.
 */
const FEATURES: FeatureSeed[] = [
  { title: "دسترسی به همه قالب‌ها در هر اندازه دلخواه", type: "general" },
  { title: "دانلود PDF، AI و DXF در اندازه واقعی", type: "general" },
  { title: "خطوط برش، تا و بلید در لایه‌های جدا", type: "general" },
  { title: "پیش‌نمایش سه‌بعدی و تخت بدون واترمارک", type: "general" },
  { title: "بارگذاری طرح چاپ و دیدن آن روی دایلاین و مدل سه‌بعدی", type: "general" },
  { title: "بررسی خودکار خطای دایلاین پیش از دانلود", type: "general" },
  { title: "ذخیره نسخه‌ها و دانلود دوباره", type: "paid" },
  { title: "ثبت مشتری و تاریخچه دانلود هر مشتری", type: "paid" },
  { title: "شخصی‌سازی قالب: پنجره، سوراخ، نوع لبه و گردی گوشه", type: "paid" },
  { title: "بالاترین سهمیه دانلود در میان پلن‌ها", type: "paid" },
  { title: "پشتیبانی در اولویت", type: "paid" },
];

/** Only the organization plan has these; its quota is ten times Standard's in every period. */
const ORGANIZATION_ONLY = ["بالاترین سهمیه دانلود در میان پلن‌ها", "پشتیبانی در اولویت"];

const BASE_FEATURES = FEATURES.filter((feature) => feature.type === "general").map((feature) => feature.title);

// Final prices, in toman. Three months cost about 2.6 months (12% off) and a year
// costs exactly 9 months, the "three months free" the pricing page promises, so
// `discountAmount` stays 0 rather than discounting twice. Downloads scale with
// the period; organization has ten times standard's in every period, so it has
// the highest download quota.
const TARRIFS: TarrifSeed[] = [
  {
    key: "standard",
    title: "استاندارد",
    shortDescription: "برای طراحان مستقل و سفارش‌های گاه‌به‌گاه",
    description:
      "همه قالب‌ها را در اندازه دلخواه بسازید و فایل آماده قالب‌سازی بگیرید؛ مناسب طراحی که هر ماه چند جعبه طراحی می‌کند.",
    isRecommended: false,
    discountAmount: 0,
    price: { monthly: 490_000, threeMonth: 1_290_000, annual: 4_410_000 },
    fairDownload: { monthly: 20, threeMonth: 60, annual: 240 },
    features: BASE_FEATURES,
  },
  {
    key: "pro",
    title: "حرفه‌ای",
    shortDescription: "برای طراحان و استودیوهای بسته‌بندی",
    description:
      "قالب‌ها را برای هر مشتری شخصی‌سازی کنید، نسخه‌ها را ذخیره کنید و فهرست مشتریان خود را داشته باشید.",
    isRecommended: true,
    discountAmount: 0,
    price: { monthly: 990_000, threeMonth: 2_590_000, annual: 8_910_000 },
    fairDownload: { monthly: 60, threeMonth: 180, annual: 720 },
    features: FEATURES.filter((feature) => !ORGANIZATION_ONLY.includes(feature.title)).map((feature) => feature.title),
  },
  {
    key: "organization",
    title: "سازمانی",
    shortDescription: "برای چاپخانه‌ها و تولیدکنندگان بسته‌بندی",
    description:
      "همه امکانات حرفه‌ای با سهمیه دانلود بالا و پشتیبانی در اولویت؛ مناسب چاپخانه و کارگاهی که هر روز دایلاین تحویل می‌دهد.",
    isRecommended: false,
    discountAmount: 0,
    price: { monthly: 2_490_000, threeMonth: 6_490_000, annual: 22_410_000 },
    fairDownload: { monthly: 200, threeMonth: 600, annual: 2_400 },
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
