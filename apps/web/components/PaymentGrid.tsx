"use client";

import { PlanKey } from "@/data/plan";
import { mapPeriodLabel, mapUserPlanTitle } from "@/data/user";
import { usePaymentCheckout } from "@/hooks/usePaymentCheckout";
import { DiscountFormType, discountFormSchema } from "@/lib/validatoinSchema";
import { formatPrice } from "@/utils/formatPrice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import Card from "@repo/ui/components/custom/Card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@repo/ui/components/separator";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { PaymentPlans } from "./PaymentPlans";
import { SubPeriod } from "./SubscriptionList";

export type PaymentQuery = {
  plan?: PlanKey | undefined;
  period?: SubPeriod | undefined;
};

const PaymentGrid = ({ query }: { query: PaymentQuery }) => {
  // HOOKS
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<
    string | undefined
  >(undefined);
  const form = useForm<DiscountFormType>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: {
      discountCode: "",
    },
  });

  const { discount, checkoutInfo, period, plan, setPeriod, setPlan } =
    usePaymentCheckout({
      discountCode: appliedDiscountCode,
      query,
    });

  useEffect(() => {
    if (discount.error) {
      toast.error(discount.error);
    }
    if (discount.success) {
      toast.success(discount.success);
    }
  }, [checkoutInfo]);

  const discountCode = useWatch({
    control: form.control,
    name: "discountCode",
  });

  const applyDiscountCode = () => {
    if (appliedDiscountCode) {
      setAppliedDiscountCode(undefined);
      form.resetField("discountCode");
      toast.info("کد تخفیف حذف شد.");
    } else if (discountCode) {
      setAppliedDiscountCode(discountCode);
    }
  };

  const onStartPayment = () => {
    const data = {
      total: checkoutInfo.total,
      amount: checkoutInfo.amount,
      discountAmount: checkoutInfo.discountAmount,
      discountCode,
    };

    console.log(data);
  };

  const paymentData = useMemo(
    () => [
      {
        title: "اشتراک:",
        value: `${mapPeriodLabel(period)} | ${mapUserPlanTitle(plan)}`,
      },
      { title: "مجموع:", value: formatPrice(checkoutInfo.amount, true) },
      {
        title: "تخفیف:",
        value: formatPrice(checkoutInfo.discountAmount, true),
      },
      { title: "قابل پرداخت:", value: formatPrice(checkoutInfo.total, true) },
    ],
    [plan, period, checkoutInfo]
  );

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

          <Form {...form}>
            <form className="space-y-5">
              <FormField
                control={form.control}
                name="discountCode"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="کد تخفیف..."
                          disabled={!!appliedDiscountCode}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant={"ghost"}
                          size={"sm"}
                          className="absolute left-1 top-1/2 -translate-y-1/2"
                          onClick={applyDiscountCode}
                          disabled={!form.formState.isValid}
                        >
                          {appliedDiscountCode ? "حذف" : "بررسی"}
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>

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
