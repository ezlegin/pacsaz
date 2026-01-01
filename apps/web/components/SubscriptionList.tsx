"use client";

import { Badge } from "@workspace/ui/components/badge";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import { Flag } from "lucide-react";
import React, { useState } from "react";
import { SubCardProps, SubscriptionCard } from "./SubscriptionCard";
type Period = "monthly" | "yearly";

const SubscriptionList = () => {
  const [period, setPeriod] = useState<Period>("monthly");
  const discountFactor = 0.35;

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

      <ToggleGroup
        value={period}
        type="single"
        spacing={1}
        size={"sm"}
        className="bg-foreground/5 p-1"
        onValueChange={(val: Period | "") => {
          if (val === "") return;
          setPeriod(val);
        }}
      >
        <ToggleGroupItem className="cursor-pointer w-32" value="yearly">
          <Badge variant={"destructive"}>-35%</Badge>
          سالانه
        </ToggleGroupItem>
        <ToggleGroupItem className="cursor-pointer w-32" value="monthly">
          ماهانه
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="flex gap-5">
        {subPlans.map((p, idx) => (
          <SubscriptionCard
            key={idx}
            props={p}
            index={idx}
            discountFactor={discountFactor}
            isYearly={period === "yearly"}
          />
        ))}
      </div>
    </div>
  );
};

export default SubscriptionList;

const subPlans: SubCardProps[] = [
  {
    title: "استاندارد",
    description:
      "مناسب طراحان تازه‌کار و دانشجویانی که می‌خواهند بدون دردسر، دایلاین‌های آماده و دقیق برای پروژه‌های خود بسازند.",
    failDownload: 50,
    price: 399,
  },
  {
    title: "حرفه‌ای",
    description:
      "بهترین انتخاب برای طراحان حرفه‌ای و فریلنسرها؛ دسترسی گسترده‌تر، آزادی عمل بیشتر و سرعت بالاتر در آماده‌سازی دایلاین‌ها.",
    failDownload: 100,
    price: 699,
  },
  {
    title: "سازمانی",
    description:
      "مناسب چاپخانه‌ها و تیم‌های طراحی بزرگ که به تولید نامحدود، دقت صنعتی و جریان کاری پایدار نیاز دارند.",
    failDownload: 400,
    price: 1399,
  },
];
