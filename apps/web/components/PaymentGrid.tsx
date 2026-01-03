"use client";

import { PlanKey } from "@/data/subscription";
import { testUser } from "@/data/user";
import { useUpgradeSubscriptionCheckout } from "@/hooks/useSubscriptionCheckout";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import Card from "./Card";
import { PaymentPlans } from "./PaymentPlans";
import { SubPeriod } from "./SubscriptionList";

export type PaymentQuery = {
  plan?: PlanKey | undefined;
  period?: SubPeriod | undefined;
};
interface Props {
  query: PaymentQuery;
}

const PaymentGrid = ({ query }: Props) => {
  const { paymentInfo, setPeriod, setPlan, period, plan, total } =
    useUpgradeSubscriptionCheckout({ user: testUser, query });

  const onStartPayment = () => {
    console.log("Payment Started");
  };

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
