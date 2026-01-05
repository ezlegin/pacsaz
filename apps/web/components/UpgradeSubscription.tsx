"use client";

import { PlanKey, plans } from "@/data/subscription";
import { testUser } from "@/data/user";
import { useUpgradeSubscriptionCheckout } from "@/hooks/useSubscriptionCheckout";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { Separator } from "@repo/ui/components/separator";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import Card from "./Card";
import PeriodSwitch from "./PeriodSwitch";
import Price from "./Price";

const UpgradeSubscription = () => {
  const { paymentInfo, setPeriod, setPlan, period, plan, total } =
    useUpgradeSubscriptionCheckout({ user: testUser });

  const onStartPayment = () => {
    console.log("Payment Started");
  };

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

      <Card className="space-y-3">
        <ul className="text-sm text-muted-foreground space-y-2.5">
          {paymentInfo.map((p, idx) => (
            <div
              key={idx}
              className="space-y-2.5 last:font-medium last:text-foreground"
            >
              <li className="flex justify-between">
                <span>{p.title}</span>
                <span>{p.value}</span>
              </li>

              <Separator />
            </div>
          ))}
        </ul>

        <div className="relative">
          <Input placeholder="کد تخفیف..." />
          <Button
            variant={"ghost"}
            className="absolute left-0 top-1/2 -translate-y-1/2"
            size={"sm"}
          >
            بررسی
          </Button>
        </div>

        <Button
          onClick={onStartPayment}
          size={"lg"}
          className="w-full"
          variant={"gradient"}
        >
          پرداخت {total.toLocaleString("en-US")} تومان
        </Button>
      </Card>
    </div>
  );
};

export default UpgradeSubscription;
