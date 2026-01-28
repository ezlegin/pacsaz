import { PaymentQuery } from "@/components/PaymentGrid";
import { useState } from "react";
import { applyDiscount } from "@repo/lib/utils/applyDiscount";
import { periodMultiplier } from "@repo/lib/utils/periodMultiplier";
import { PlanKey, PlanPeriod, plans } from "@repo/lib/data/plans";

export type CheckoutInfo = {
  amount: number;
  discountAmount: number;
  total: number;
};

export type DiscountInfo = {
  error: string | null;
  success: string | null;
  code: string | undefined;
};

export function usePaymentCheckout({
  discountCode,
  query,
  defaultPlan,
}: {
  discountCode?: string;
  query?: PaymentQuery;
  defaultPlan?: PlanKey;
}) {
  const [plan, setPlan] = useState<PlanKey>(
    defaultPlan || query?.plan || "pro",
  );
  const [period, setPeriod] = useState<PlanPeriod>(query?.period || "monthly");

  const plansInfo = plans.map((p) => ({ planKey: p.key, planPrice: p.price }));
  const selectedPlan = plansInfo.find((p) => p.planKey === plan)!;

  const baseAmount = periodMultiplier(period, selectedPlan.planPrice, false);
  let total = periodMultiplier(period, selectedPlan.planPrice, true);

  let error: string | null = null;
  let success: string | null = null;

  if (discountCode) {
    const result = applyDiscount(total, discountCode);
    if (result.error) {
      error = result.error;
    } else if (result.success !== undefined) {
      total = result.total;
      success = result.success;
    }
  }

  const checkoutInfo: CheckoutInfo = {
    amount: baseAmount,
    discountAmount: baseAmount - total,
    total,
  };

  const discountInfo: DiscountInfo = {
    error,
    success,
    code: discountCode,
  };

  return {
    checkoutInfo,
    discountInfo,
    plan,
    period,
    setPlan,
    setPeriod,
  };
}
