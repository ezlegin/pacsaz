import { PaymentQuery } from "@/components/PaymentGrid";
import { SubPeriod } from "@/components/SubscriptionList";
import { annualPlanDisocunt, PlanKey, plans } from "@/data/plan";
import { useState } from "react";

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
    defaultPlan || query?.plan || "pro"
  );
  const [period, setPeriod] = useState<SubPeriod>(query?.period || "monthly");

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

  return {
    checkoutInfo: {
      amount: baseAmount,
      discountAmount: baseAmount - total,
      total,
    },
    discount: { error, success },
    plan,
    period,
    setPlan,
    setPeriod,
  };
}

export function periodMultiplier(
  period: SubPeriod,
  amount: number,
  applyAnnualDiscount: boolean
) {
  if (period === "3-month") amount *= 3;
  if (period === "annual")
    amount *= 12 * (applyAnnualDiscount ? 1 - annualPlanDisocunt : 1);

  return +(amount / 1000).toFixed() * 1000;
}

function applyDiscount(amount: number, discountCode: string) {
  const db = [
    {
      code: "pacsazx",
      amount: 50,
      type: "percent",
      expiresAt: new Date("2026-01-13"),
    },
    {
      code: "pacsaz",
      amount: 10,
      type: "percent",
      expiresAt: new Date("2026-03-17"),
    },
  ]; //todo: remove this part and use DB

  const discount = db.find((d) => d.code === discountCode);

  if (!discount) return { error: "Code Not Found" };
  if (discount.expiresAt < new Date()) return { error: "Code is expired" };

  const total =
    discount.type === "fixed"
      ? Math.max(amount - discount.amount, 0)
      : amount * (1 - discount.amount / 100);

  return { total, success: "کد تخفیف با موفقیت اعمال شد." };
}
