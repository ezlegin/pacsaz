import { applyDiscount } from "@repo/lib/utils/applyDiscount";
import { periodMultiplier } from "@repo/lib/utils/periodMultiplier";
import { PlanKey, PlanPeriod, plans } from "@repo/lib/data/plans";

export function usePaymentCheckout({
  period,
  plan,
  discountCode,
}: {
  plan: PlanKey;
  period: PlanPeriod;
  discountCode?: string;
}) {
  const plansInfo = plans.map((p) => ({ planKey: p.key, planPrice: p.price }));
  const selectedPlan = plansInfo.find((p) => p.planKey === plan)!;

  let total = periodMultiplier(period, selectedPlan.planPrice, true);

  if (discountCode) {
    const result = applyDiscount(total, discountCode);
    if (result.error) return { error: result.error };

    if (result.total) total = result.total;
  }

  const amount = periodMultiplier(period, selectedPlan.planPrice, false);
  const discountAmount = amount - total;

  const paymentInfo = {
    amount,
    discountAmount,
    total,
  };

  return {
    paymentInfo,
    total,
  };
}
