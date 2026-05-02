import { FairDownload, Price as PriceType, TarrifFeature } from "@repo/db";
import { PlanPeriod } from "@repo/lib/data/plans";
import { Button } from "@repo/ui/components/button";
import Card from "@repo/ui/components/custom/Card";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import { CircleCheck, Zap } from "lucide-react";
import Link from "next/link";
import Price from "./Price";
import { TarrifType } from "./SubscriptionList";

export const SubscriptionCard = ({
  tarrif,
  features,
  period,
}: {
  features: TarrifFeature[];
  tarrif: TarrifType;
  period: PlanPeriod;
}) => {
  return (
    <div
      className={cn(
        tarrif.isRecommended && "bg-linear-to-r from-violet-500 to-purple-500",
        "p-1 rounded-2xl group",
      )}
    >
      {tarrif.isRecommended && (
        <div className="flex justify-center items-center gap-1 text-sm pt-1.5 font-medium text-primary-foreground">
          <Zap size={16} fill="#8c38fe" />
          پیشنهاد پک ساز
        </div>
      )}

      <Card
        className={cn(
          tarrif.isRecommended
            ? "mt-2 rounded-lg bg-background"
            : "mt-9 rounded-2xl",
          "p-5 space-y-8 w-xs",
        )}
      >
        <div className="flex flex-col gap-3">
          <span className="font-semibold">{tarrif.title}</span>
          <Price period={period} price={PriceMap(period, tarrif.price!)} />
          <p className="text-xs text-muted-foreground">{tarrif.description}</p>
        </div>

        <Link href={`/payment?plan=${tarrif.key}&period=${period}`}>
          <Button
            variant={tarrif.isRecommended ? "gradient" : "primaryForeground"}
            className="w-full mb-8"
          >
            خرید اشتراک
          </Button>
        </Link>

        <div className="space-y-3 text-sm font-medium">
          <Separator />
          <div>
            دانلود منصفانه: {FairDownloadMap(period, tarrif.fairDownload!)} عدد
          </div>
          <Separator />
          <ul className="text-xs text-muted-foreground space-y-1.5">
            {features.map((f, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CircleCheck
                  size={13}
                  className={
                    tarrif.features.some((tf) => tf.title === f.title)
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }
                />
                {f.title}
              </li>
            ))}
          </ul>
        </div>
      </Card>
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

const PriceMap = (period: PlanPeriod, price: PriceType) => {
  switch (period) {
    case "monthly":
      return price.monthly;
    case "threeMonth":
      return price.threeMonth;
    case "annual":
      return price.annual;
  }
};
