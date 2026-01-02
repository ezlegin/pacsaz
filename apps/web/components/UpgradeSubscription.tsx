"use client";

import { testUser } from "@/data/user";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import { SquareArrowOutUpRight, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Card from "./Card";
import PeriodSwitch from "./PeriodSwitch";
import Price from "./Price";
import { SubPeriod } from "./SubscriptionList";
import { PlanKey, plans } from "@/data/subscription";

const UpgradeSubscription = () => {
  const [plan, setPlan] = useState<PlanKey>(
    (plans.find((p) => p.level === testUser.plan.level + 1)?.key as PlanKey) ||
      "standard"
  );
  const [period, setPeriod] = useState<SubPeriod>("monthly");

  return (
    <div className="space-y-6">
      <PeriodSwitch isAnnual={period === "annual"} setPeriod={setPeriod} />

      <RadioGroup
        defaultValue={plan}
        onValueChange={(val: PlanKey) => setPlan(val)}
        dir="rtl"
      >
        {plans.map((p, i) => (
          <Card
            key={i}
            primaryTheme={p.key === plan}
            className="flex items-center p-0 gap-3 px-3"
          >
            <RadioGroupItem
              disabled={p.level === testUser.plan.level}
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
              {p.key === testUser.plan.key ? (
                <div className="text-xs text-primary ">(پلن فعال)</div>
              ) : (
                <div>
                  <Price
                    isAnnual={period === "annual"}
                    price={p.price}
                    size="sm"
                  />
                </div>
              )}
            </Label>
          </Card>
        ))}
      </RadioGroup>

      <div>
        <Link target="_blank" href={"/subscription"}>
          <Button
            size={"sm"}
            variant={"link"}
            className="text-xs text-primary hover:text-primary hover:no-underline"
          >
            <SquareArrowOutUpRight className="scale-90" />
            مشاهده ویژگی پلن ها
          </Button>
        </Link>
      </div>

      <div>
        <Link href={`/payment?plan=${plan}&period=${period}`}>
          <Button size={"lg"} variant={"gradient"} className="w-full">
            <Zap />
            ارتقا اشتراک
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default UpgradeSubscription;
