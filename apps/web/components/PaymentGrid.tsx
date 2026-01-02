"use client";

import { PlanKey, plans } from "@/data/subscription";
import { mapPeriodLabel } from "@/data/user";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import { useState } from "react";
import Card from "./Card";
import { PaymentPlans } from "./PaymentPlans";
import { SubPeriod } from "./SubscriptionList";

interface Props {
  query: {
    plan: PlanKey | undefined;
    period: SubPeriod | undefined;
  };
}

const PaymentGrid = ({ query }: Props) => {
  const [plan, setPlan] = useState<PlanKey>(query.plan || "pro");
  const [period, setPeriod] = useState<SubPeriod>(query.period || "monthly");

  const selectedPlan = plans.find((p) => p.key == plan);
  const monthlyTotal =
    period === "monthly"
      ? selectedPlan?.price.monthly!
      : selectedPlan?.price.monthly! * 12;

  const total =
    period === "monthly"
      ? selectedPlan?.price.monthly!
      : selectedPlan?.price.annual!;

  const discount = monthlyTotal - total;

  const onStartPayment = () => {
    console.log("Payment Started");
  };

  const paymentInfo = [
    { title: "پلن:", value: mapPeriodLabel(period) },
    { title: "مجموع:", value: monthlyTotal.toLocaleString("en-US") },
    { title: "تخفیف:", value: discount.toLocaleString("en-US") },
    { title: "قابل پرداخت:", value: total.toLocaleString("en-US") },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex gap-6">
        <PaymentPlans
          period={period}
          plan={plan}
          setPeriod={setPeriod}
          setPlan={setPlan}
        />

        <Card className="w-1/3 h-fit space-y-3">
          <ul className="text-sm text-muted-foreground space-y-2.5">
            {paymentInfo.map((p, idx) => (
              <div
                key={idx}
                className="space-y-2.5 last:font-medium last:text-foreground"
              >
                <li className="flex justify-between">
                  <span>{p.title}</span>
                  <span>
                    {p.value} {idx !== 0 && "تومان"}
                  </span>
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
    </div>
  );
};

export default PaymentGrid;
