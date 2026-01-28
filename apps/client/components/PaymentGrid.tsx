"use client";

import { usePaymentCheckout } from "@/hooks/usePaymentCheckout";
import { mapPaymentData } from "@/utils/mapPaymentData";
import { Button } from "@repo/ui/components/button";
import Card from "@repo/ui/components/custom/Card";
import { Separator } from "@repo/ui/components/separator";
import { useState } from "react";
import { PaymentPlans } from "./PaymentPlans";
import DiscountForm from "./forms/DiscountForm";
import { formatPrice } from "@repo/lib/utils/formatPrice";
import { PlanKey, PlanPeriod } from "@repo/lib/data/plans";

export type PaymentQuery = {
  plan?: PlanKey | undefined;
  period?: PlanPeriod | undefined;
};

const PaymentGrid = ({ query }: { query: PaymentQuery }) => {
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<
    string | undefined
  >(undefined);

  const { discountInfo, checkoutInfo, period, plan, setPeriod, setPlan } =
    usePaymentCheckout({
      discountCode: appliedDiscountCode,
      query,
    });

  const onStartPayment = () => {
    const data = {
      total: checkoutInfo.total,
      amount: checkoutInfo.amount,
      discountAmount: checkoutInfo.discountAmount,
      discountCode: discountInfo.code,
      plan,
      period,
    };

    console.log(data);
  };

  const paymentData = mapPaymentData(period, plan, checkoutInfo);

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
    </div>
  );
};

export default PaymentGrid;
