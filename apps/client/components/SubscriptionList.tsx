"use client";

import { Badge } from "@repo/ui/components/badge";
import { Flag } from "lucide-react";
import { useState } from "react";
import PeriodSwitch from "./PeriodSwitch";
import { SubscriptionCard } from "./SubscriptionCard";
import { PlanPeriod, plans } from "@repo/lib/data/plans";

export const discountFactor = 0.35;

const SubscriptionList = () => {
  const [period, setPeriod] = useState<PlanPeriod>("monthly");

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 z-10">
      <div className="w-sm text-center flex flex-col items-center gap-3">
        <Badge variant={"lightPrimary"}>
          <Flag />
          اشتراک
        </Badge>

        <h1 className="text-3xl font-semibold">
          یک اشتراک، بی‌نهایت دایلاین...
        </h1>
        <p className="text-xs text-muted-foreground">
          با فعال‌سازی اشتراک، به تمام قالب‌ها، اندازه‌ها و ابزارهای حرفه‌ای
          دسترسی کامل داشته باش. بدون محدودیت، بدون دغدغه.
        </p>
      </div>

      <PeriodSwitch period={period} setPeriod={setPeriod} />

      <div className="flex gap-5">
        {plans.map((p, idx) => (
          <SubscriptionCard
            key={idx}
            props={p}
            features={p.features}
            index={idx}
            period={period}
          />
        ))}
      </div>
    </div>
  );
};

export default SubscriptionList;
