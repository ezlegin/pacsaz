import { PriceMapper } from "@/lib/map";
import { FairDownload, PlanPeriod, TarrifFeature } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { ArrowLeft, Check, Download, Layers, Sparkles } from "lucide-react";
import Link from "next/link";
import { TarrifType } from "./SubscriptionList";

const PERIOD_SUFFIX: Record<PlanPeriod, string> = {
  monthly: "ماه",
  threeMonth: "۳ ماه",
  annual: "سال",
};

const faDigits = (value: number) =>
  Math.round(value).toLocaleString("fa-IR", { useGrouping: false });

/** Prices are stored in Rial-ish units; the UI shows them in thousand Toman. */
const formatPrice = (value: number) => (value / 1000).toLocaleString("fa-IR");

/**
 * One plan. `features` are only what this plan adds to `below` (the plan it
 * builds on), so the list reads "everything in Standard, plus: ...". Without
 * `below` it is the entry plan and lists everything it includes.
 */
export const SubscriptionCard = ({
  tarrif,
  below,
  features,
  period,
}: {
  tarrif: TarrifType;
  below?: TarrifType;
  features: TarrifFeature[];
  period: PlanPeriod;
}) => {
  const isRecommended = tarrif.isRecommended;
  const discount = tarrif.discountAmount ?? 0;

  /**
   * `Price` and `FairDownload` are optional relations, so a plan saved in the
   * admin before its pricing rows are filled in arrives with `null`. A missing
   * price reads as zero rather than crashing the page (the home page embeds it).
   */
  const finalPrice = tarrif.price ? PriceMapper(period, tarrif.price, 0) : 0;
  const basePrice =
    discount > 0 && discount < 100 ? finalPrice / (1 - discount / 100) : finalPrice;
  const saved = basePrice - finalPrice;

  const downloadCount = tarrif.fairDownload
    ? fairDownloadFor(period, tarrif.fairDownload)
    : 0;

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-3xl bg-background transition-all duration-300",
        isRecommended
          ? "border-2 border-primary shadow-xl shadow-primary/15 xl:-my-4"
          : "border shadow-sm hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10",
      )}
    >
      {isRecommended && (
        <span className="absolute -top-3.5 right-1/2 inline-flex translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-[11px] font-bold whitespace-nowrap text-primary-foreground shadow-md shadow-primary/30">
          <Sparkles className="size-3.5" />
          محبوب‌ترین انتخاب
        </span>
      )}

      {/* ------------------------- name, price, action ------------------------ */}
      <div
        className={cn(
          "flex flex-col gap-5 rounded-t-3xl p-6 pb-5",
          isRecommended && "bg-linear-to-b from-primary/8 to-transparent pt-8",
        )}
      >
        <div className="space-y-1.5">
          <h3 className="text-xl font-extrabold tracking-tight">{tarrif.title}</h3>
          <p className="min-h-10 text-xs leading-5 text-muted-foreground">
            {tarrif.shortDescription || tarrif.description}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline gap-1.5">
            <span
              className={cn(
                "text-4xl font-black tracking-tight",
                isRecommended && "text-primary",
              )}
            >
              {formatPrice(finalPrice)}
            </span>
            <span className="text-sm font-semibold">تومان</span>
            <span className="text-xs text-muted-foreground">
              / {PERIOD_SUFFIX[period]}
            </span>
          </div>

          <div className="flex h-5 flex-wrap items-center gap-2">
            {discount > 0 && saved > 0 && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(basePrice)}
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {faDigits(discount)}٪ تخفیف
                </span>
              </>
            )}
          </div>
        </div>

        <Link href={`/payment?plan=${tarrif.key}&period=${period}`} className="block">
          <Button
            variant={isRecommended ? "gradient" : "primaryForeground"}
            size="lg"
            className="group w-full"
          >
            شروع با {tarrif.title}
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
          </Button>
        </Link>
      </div>

      {/* ------------------------------ features ------------------------------ */}
      <div className="flex flex-1 flex-col gap-4 border-t border-dashed px-6 pt-5 pb-6">
        <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-background text-primary shadow-sm">
            <Download className="size-4" strokeWidth={2} />
          </span>
          <p className="text-sm font-bold">
            {faDigits(downloadCount)}{" "}
            <span className="text-xs font-medium text-muted-foreground">
              دانلود منصفانه در {PERIOD_SUFFIX[period]}
            </span>
          </p>
        </div>

        {below ? (
          <p className="flex items-start gap-2 text-sm font-semibold leading-6">
            <Layers className="mt-1 size-4 shrink-0 text-primary" strokeWidth={2} />
            <span>
              همه ویژگی‌های پلن{" "}
              <span className="text-primary">{below.title}</span>، به علاوه:
            </span>
          </p>
        ) : (
          <p className="text-sm font-semibold">شامل:</p>
        )}

        <ul className="space-y-1.5">
          {features.map((f) => (
            <li key={f.id} className="flex items-start gap-2 text-sm leading-6">
              <span
                className={cn(
                  "mt-1 grid size-4 shrink-0 place-items-center rounded-full",
                  isRecommended
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary",
                )}
              >
                <Check className="size-2.5" strokeWidth={3.5} />
              </span>
              {f.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const fairDownloadFor = (period: PlanPeriod, fairDownload: FairDownload) => {
  switch (period) {
    case "monthly":
      return fairDownload.monthly;
    case "threeMonth":
      return fairDownload.threeMonth;
    case "annual":
      return fairDownload.annual;
  }
};
