"use client";

import { PlanKey } from "@/data/subscription";
import { usePaymentCheckout } from "@/hooks/useSubscriptionCheckout";
import { formatPrice } from "@/utils/formatPrice";
import { Button } from "@repo/ui/components/button";
import Card from "@repo/ui/components/custom/Card";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@repo/ui/components/separator";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  const [plan, setPlan] = useState<PlanKey>(query?.plan || "pro");
  const [period, setPeriod] = useState<SubPeriod>(query?.period || "monthly");
  const [discountCode, setDiscountCode] = useState("");
  const [paymentInfo, setPaymentInfo] = useState<{
    amount: number;
    discountAmount: number;
    total: number;
  }>({ amount: 0, discountAmount: 0, total: 0 });

  const onStartPayment = () => {
    console.log("Payment Started");
  };

  useEffect(() => {
    const checkout = usePaymentCheckout({
      plan,
      period,
      discountCode,
    });

    if (checkout.error) {
      toast.error(checkout.error);
    }

    if (checkout.paymentInfo) setPaymentInfo(checkout.paymentInfo);
  }, [plan, period, discountCode]);

  const checkout = [
    { title: "مجموع:", value: formatPrice(paymentInfo.amount) },
    { title: "تخفیف:", value: formatPrice(paymentInfo.discountAmount) },
    { title: "قابل پرداخت:", value: formatPrice(paymentInfo.total) },
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
            {checkout.map((p, idx) => (
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
            پرداخت {paymentInfo.total.toLocaleString("en-US")} تومان
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default PaymentGrid;
