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
import { cn } from "@repo/ui/lib/utils";
import {
  BadgeCheck,
  Flag,
  Infinity as InfinityIcon,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { SubscriptionCard } from "./SubscriptionCard";

export interface TarrifType extends Tarrif {
  price: Price | null;
  fairDownload: FairDownload | null;
  features: SelectedTarrifFeature[];
}

const PERIODS: { value: PlanPeriod; label: string; hint?: string }[] = [
  { value: "monthly", label: "ماهیانه" },
  { value: "threeMonth", label: "۳ ماهه" },
  { value: "annual", label: "سالیانه", hint: "۳۰٪ تخفیف" },
];

const SubscriptionList = ({
  tarrif,
  features,
}: {
  tarrif: TarrifType[];
  features: TarrifFeature[];
}) => {
  const [period, setPeriod] = useState<PlanPeriod>("monthly");

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-10 px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-20 h-72 bg-[radial-gradient(55%_100%_at_50%_0%,var(--color-primary),transparent_70%)] opacity-[0.08]"
      />

      {/* ------------------------------- header ------------------------------ */}
      <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
        <Badge variant="lightPrimary" className="px-3 py-1">
          <Flag />
          اشتراک پک‌ساز
        </Badge>

        <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          یک اشتراک،{" "}
          <span className="bg-linear-to-l from-violet-500 to-purple-600 bg-clip-text text-transparent">
            بی‌نهایت دایلاین
          </span>
        </h2>

        <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
          با فعال‌سازی اشتراک، به تمام قالب‌ها، اندازه‌ها و ابزارهای حرفه‌ای
          دسترسی کامل داری. بدون محدودیت، بدون دغدغه.
        </p>
      </div>

      {/* --------------------------- period selector -------------------------- */}
      <div className="flex w-full flex-col items-center gap-3">
        <div className="flex items-center gap-1 rounded-2xl border bg-muted/50 p-1.5 shadow-sm backdrop-blur">
          {PERIODS.map(({ value, label, hint }) => {
            const isActive = period === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                aria-pressed={isActive}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300",
                  "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  isActive
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
                {hint && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors duration-300",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {hint}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          با پرداخت سالیانه، معادل ۳ ماه هدیه می‌گیری.
        </p>
      </div>

      {/* ------------------------------- plans -------------------------------- */}
      <div className="grid w-full grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
        {tarrif.map((t) => (
          <SubscriptionCard
            key={t.id}
            tarrif={t}
            period={period}
            features={features}
          />
        ))}
      </div>

      {/* ------------------------------ trust bar ----------------------------- */}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border bg-background/60 px-6 py-4 backdrop-blur">
        {[
          { icon: Zap, text: "دسترسی آنی پس از پرداخت" },
          { icon: InfinityIcon, text: "دانلود قالب بدون محدودیت زمانی" },
          { icon: BadgeCheck, text: "مجوز استفاده تجاری" },
        ].map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Icon className="size-4 text-primary" strokeWidth={1.9} />
            {text}
          </div>
        ))}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Sparkles className="size-3.5 text-primary" />
        امکان تغییر یا ارتقای پلن در هر زمان وجود دارد.
      </p>
    </div>
  );
};

export default SubscriptionList;
