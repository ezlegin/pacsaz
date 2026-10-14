import { PriceMapper } from "@/lib/map";
import { FairDownload, PlanPeriod, TarrifFeature } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowLeft,
  Check,
  Download,
  Heart,
  Minus,
} from "lucide-react";
import Link from "next/link";
import { TarrifType } from "./SubscriptionList";
import { Badge } from "@repo/ui/components/badge";

const PERIOD_SUFFIX: Record<PlanPeriod, string> = {
  monthly: "ماه",
  threeMonth: "۳ ماه",
  annual: "سال",
};

const faDigits = (value: number) =>
  Math.round(value).toLocaleString("fa-IR", { useGrouping: false });

/** Prices are stored in Rial-ish units; the UI shows them in thousand Toman. */
const formatPrice = (value: number) => (value / 1000).toLocaleString("fa-IR");

export const SubscriptionCard = ({
  tarrif,
  features,
  period,
}: {
  features: TarrifFeature[];
  tarrif: TarrifType;
  period: PlanPeriod;
}) => {
  const isRecommended = tarrif.isRecommended;
  const discount = tarrif.discountAmount ?? 0;

  const finalPrice = PriceMapper(period, tarrif.price!, 0);
  const basePrice = finalPrice / (1 - discount / 100);
  const saved = basePrice - finalPrice;

  const downloadCount = FairDownloadMap(period, tarrif.fairDownload!);

  return (
    <div
      className={cn(
        "relative flex h-full flex-col",
        isRecommended && "xl:-my-4",
      )}
    >
      {/* recommendation ribbon */}
      {/* {isRecommended && (
        <div className="mb-3 flex items-center justify-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-l from-violet-500 to-purple-600 px-3 py-1 text-[11px] font-bold text-white shadow-md shadow-primary/30">
            <Zap className="size-3.5" fill="currentColor" strokeWidth={0} />
            پیشنهاد پک‌ساز
          </span>
        </div>
      )} */}

      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden rounded-3xl bg-background transition-all duration-300",
          isRecommended
            ? "p-[1.5px] shadow-xl shadow-primary/20 ring-1 ring-primary/20 hover:shadow-2xl hover:shadow-primary/30"
            : "border shadow-sm hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10",
        )}
      >
        <div
          className={cn(
            "flex flex-1 flex-col",
            isRecommended &&
              "rounded-[calc(1.5rem-1.5px)] bg-linear-to-b from-primary/6 to-transparent p-6",
            !isRecommended && "p-6",
          )}
        >
          {/* ------------------------------ header ----------------------------- */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-extrabold tracking-tight">
                {tarrif.title}
              </h3>

              {isRecommended && (
                <Badge className="py-1">
                  <Heart className="size-3" fill="white" />
                  محبوب‌ترین
                </Badge>
              )}
            </div>

            <p className="min-h-10 text-xs leading-5 text-muted-foreground">
              {tarrif.shortDescription || tarrif.description}
            </p>
          </div>

          {/* ------------------------------- price ----------------------------- */}
          <div className="mt-5 space-y-2">
            <div className="flex items-end gap-2">
              <span
                className={cn(
                  "font-extrabold tracking-tight",
                  isRecommended
                    ? "bg-linear-to-l from-violet-600 to-purple-600 bg-clip-text text-4xl text-transparent"
                    : "text-4xl",
                )}
              >
                {formatPrice(finalPrice)}
              </span>
              <span className="pb-1 text-sm font-medium">تومان</span>
              <span className="pb-1 text-xs text-muted-foreground">
                / {PERIOD_SUFFIX[period]}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(basePrice)}
                </span>
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-600">
                  {faDigits(saved)} تومان صرفه‌جویی
                </span>
              </div>
            )}
          </div>

          {/* -------------------------------- cta ------------------------------ */}
          <Link
            href={`/payment?plan=${tarrif.key}&period=${period}`}
            className="mt-5 block"
          >
            <Button
              variant={isRecommended ? "gradient" : "primaryForeground"}
              size={isRecommended ? "xl" : "lg"}
              className="group w-full"
            >
              خرید اشتراک
              <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
            </Button>
          </Link>

          {/* --------------------------- download quota ------------------------- */}
          <div className="mt-5 flex items-center gap-3 rounded-2xl border bg-background/70 p-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Download className="size-4" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">
                دانلود منصفانه
              </p>
              <p className="text-sm font-bold">
                {faDigits(downloadCount)}{" "}
                <span className="text-xs font-medium text-muted-foreground">
                  قالب در {PERIOD_SUFFIX[period]}
                </span>
              </p>
            </div>
          </div>

          {/* ------------------------------ features ---------------------------- */}
          <ul className="mt-5 flex-1 space-y-2.5 border-t pt-5">
            {features.map((f) => {
              const included = tarrif.features.some(
                (tf) => tf.tarrifFeatureId === f.id,
              );

              return (
                <li
                  key={f.id}
                  className={cn(
                    "flex items-center gap-2.5 text-xs",
                    included ? "text-foreground" : "text-muted-foreground/60",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-full",
                      included
                        ? "bg-green-500/10 text-green-600"
                        : "bg-muted text-muted-foreground/60",
                    )}
                  >
                    {included ? (
                      <Check className="size-2" strokeWidth={3} />
                    ) : (
                      <Minus className="size-2" strokeWidth={3} />
                    )}
                  </span>
                  <span className={cn(!included && "line-through")}>
                    {f.title}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

const FairDownloadMap = (period: PlanPeriod, fairDownload: FairDownload) => {
  switch (period) {
    case "monthly":
      return fairDownload.monthly;
    case "threeMonth":
      return fairDownload.threeMonth;
    case "annual":
      return fairDownload.annual;
  }
};
