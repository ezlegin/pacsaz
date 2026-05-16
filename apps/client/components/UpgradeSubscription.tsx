"use client";

import { Plan, Price as PriceType, Tarrif } from "@repo/db";
import { PlanKey, PlanPeriod } from "@repo/lib/data/plans";
import { Button } from "@repo/ui/components/button";
import Card from "@repo/ui/components/custom/Card";
import { Label } from "@repo/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import PeriodSwitch from "./PeriodSwitch";
import Price from "./Price";
import { Badge } from "@repo/ui/components/badge";

export interface TarrifType extends Tarrif {
  price: PriceType | null;
}

const UpgradeSubscription = ({
  userPlan,
  tarrif,
}: {
  userPlan: Plan;
  tarrif: TarrifType[];
}) => {
  const currentPlan = tarrif.find((p) => p.level === userPlan.level + 1);
  const [plan, setPlan] = useState<PlanKey>(currentPlan?.key || "pro");
  const [period, setPeriod] = useState<PlanPeriod>(userPlan.period);

  return (
    <div className="space-y-6">
      <PeriodSwitch period={period} setPeriod={setPeriod} />

      <RadioGroup
        defaultValue={plan}
        onValueChange={(val: PlanKey) => setPlan(val)}
        dir="rtl"
      >
        {tarrif.map((p, i) => (
          <Card
            key={i}
            primaryTheme={p.key === plan}
            className="flex items-center p-0 gap-3 px-3"
          >
            <RadioGroupItem
              disabled={p.level === userPlan.level}
              value={p.key}
              id={p.key}
              className="bg-amber-950 p-0"
            />
            <Label
              htmlFor={p.key}
              className="w-full py-5 cursor-pointer flex justify-between"
            >
              <div className="space-y-1">
                <div className="text-">{p.title}</div>
                <div className="text-xs text-muted-foreground font-normal">
                  {p.shortDescription}
                </div>
              </div>
              {p.key === userPlan.key ? (
                <Badge
                  variant={"primaryForeground"}
                  className="border border-primary/50 py-1.5"
                >
                  پلن فعال
                </Badge>
              ) : (
                <div>
                  <Price period={period} price={p.price![period]} size="sm" />
                </div>
              )}
            </Label>
          </Card>
        ))}
        <Link target="_blank" href={"/subscription"} className="w-fit">
          <Button
            size={"sm"}
            variant={"link"}
            className="text-xs text-primary hover:text-primary hover:no-underline"
          >
            <SquareArrowOutUpRight className="scale-90" />
            مشاهده ویژگی پلن ها
          </Button>
        </Link>
      </RadioGroup>

      <Link href={`/payment?plan=${plan}&period=${period}`}>
        <Button size={"lg"} className="w-full" variant={"gradient"}>
          مرحله بعد
        </Button>
      </Link>
    </div>
  );
};

export default UpgradeSubscription;
