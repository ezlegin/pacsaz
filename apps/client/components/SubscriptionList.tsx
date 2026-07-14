"use client";

import {
  FairDownload,
  PlanPeriod,
  Price,
  SelectedTarrifFeature,
  Tarrif,
  TarrifFeature,
} from "@repo/db";
import { Badge } from "@repo/ui/components/badge";
import { Flag } from "lucide-react";
import { useState } from "react";
import PeriodSwitch from "./PeriodSwitch";
import { SubscriptionCard } from "./SubscriptionCard";

export const discountFactor = 0.35; //todo

export interface TarrifType extends Tarrif {
  price: Price | null;
  fairDownload: FairDownload | null;
  features: SelectedTarrifFeature[];
}

const SubscriptionList = ({
  tarrif,
  features,
}: {
  tarrif: TarrifType[];
  features: TarrifFeature[];
}) => {
  const [period, setPeriod] = useState<PlanPeriod>("monthly");

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 z-10">
      <div className="flex max-w-xl flex-col items-center gap-3 text-center px-4">
        <Badge variant="lightPrimary">
          <Flag />
          اشتراک
        </Badge>

        <h1 className="text-2xl font-semibold md:text-3xl">
          یک اشتراک، بی‌نهایت دایلاین...
        </h1>

        <p className="text-xs text-muted-foreground md:text-sm">
          با فعال‌سازی اشتراک، به تمام قالب‌ها، اندازه‌ها و ابزارهای حرفه‌ای
          دسترسی کامل داشته باش. بدون محدودیت، بدون دغدغه.
        </p>
      </div>

      <PeriodSwitch period={period} setPeriod={setPeriod} />

      <div className="grid w-full max-w-7xl grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tarrif.map((t, idx) => (
          <SubscriptionCard
            key={idx}
            tarrif={t}
            period={period}
            features={features}
          />
        ))}
      </div>
    </div>
  );
};

export default SubscriptionList;
