"use client";

import { PlanKey, plans } from "@/data/plan";
import { testUser } from "@/data/user";
import { usePaymentCheckout } from "@/hooks/usePaymentCheckout";
import { formatPrice } from "@/utils/formatPrice";
import { mapPaymentData } from "@/utils/mapPaymentData";
import { Button } from "@repo/ui/components/button";
import Card from "@repo/ui/components/custom/Card";
import { Label } from "@repo/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { Separator } from "@repo/ui/components/separator";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import DiscountForm from "./forms/DiscountForm";
import PeriodSwitch from "./PeriodSwitch";
import Price from "./Price";
import { useState } from "react";

const UpgradeSubscription = () => {
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<
    string | undefined
  >(undefined);
  const { checkoutInfo, setPeriod, setPlan, period, plan, discountInfo } =
    usePaymentCheckout({ discountCode: appliedDiscountCode });

  const onStartPayment = () => {
    console.log("Payment Started");
  };

  const paymentData = mapPaymentData(period, plan, checkoutInfo);

  return (
    <div className="space-y-6">
      <PeriodSwitch period={period} setPeriod={setPeriod} />

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
                  <Price period={period} price={p.price} size="sm" />
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
          {paymentData.map((p, idx) => (
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

        <DiscountForm
          appliedDiscountCode={appliedDiscountCode}
          setAppliedDiscountCode={setAppliedDiscountCode}
          discountInfo={discountInfo}
        />

        <Button
          onClick={onStartPayment}
          size={"lg"}
          className="w-full"
          variant={"gradient"}
        >
          پرداخت {formatPrice(checkoutInfo.total, true)}
        </Button>
      </Card>
    </div>
  );
};

export default UpgradeSubscription;
