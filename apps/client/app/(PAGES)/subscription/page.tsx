import JsonLd from "@/components/JsonLd";
import SubscriptionList from "@/components/SubscriptionList";
import {
  breadcrumbSchema,
  buildMetadata,
  SITE_NAME,
  webApplicationSchema,
} from "@/lib/seo";
import { prisma } from "@repo/db";

const PATH = "/subscription";

const page = async () => {
  const tarrif = await prisma.tarrif.findMany({
    include: { fairDownload: true, features: true, price: true },
    orderBy: { key: "asc" },
  });

  const features = await prisma.tarrifFeature.findMany();

  /**
   * Cheapest published price per billing period. Prices come from the same rows
   * the cards render, so the structured data cannot advertise a price the page
   * does not show — a mismatch there is a manual-action risk.
   */
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

  return (
    <div className="flex items-center justify-center">
      <JsonLd
        data={[
          // `prices` turns the site node into one that carries a real offer
          // catalogue, which is what a "how much does it cost" answer needs.
          webApplicationSchema({ prices }),
          breadcrumbSchema(
            [
              { name: "صفحه اصلی", path: "/" },
              { name: "اشتراک‌ها", path: PATH },
            ],
            PATH,
          ),
        ]}
      />

      <SubscriptionList
        tarrif={tarrif}
        features={features}
        headingLevel="h1"
      />
    </div>
  );
};

export default page;

export const metadata = buildMetadata({
  title: "پلن‌های اشتراک و قیمت‌ها",
  description: `مقایسه‌ی پلن‌های اشتراک ${SITE_NAME}: استاندارد، حرفه‌ای و سازمانی با پرداخت ماهانه، سه‌ماهه و سالانه؛ سهمیه دانلود، خروجی DXF و PDF و پشتیبانی اختصاصی.`,
  path: PATH,
  keywords: [
    "قیمت دایلاین",
    "اشتراک دایلاین",
    "پلن بسته بندی",
    "خرید دایلاین بسته بندی",
    "تعرفه پک‌ساز",
  ],
});
