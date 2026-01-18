import { PaymentQuery } from "@/components/PaymentGrid";
import { SubPeriod } from "@/components/SubscriptionList";
import { PlanKey, plans } from "@/data/subscription";
import { mapPeriodLabel, testUser } from "@/data/user";
import { formatPrice } from "@/utils/formatPrice";
import { useState } from "react";

export function useSubscriptionCheckout({
  user,
  query,
}: {
  user: typeof testUser;
  query?: PaymentQuery;
}) {
  const [plan, setPlan] = useState<PlanKey>(
    query?.plan ||
      (plans.find((p) => p.level === user.plan.level + 1)?.key as PlanKey) ||
      "pro"
  );
  const [period, setPeriod] = useState<SubPeriod>(query?.period || "monthly");

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

  const paymentInfo = [
    { title: "دوره اشتراک:", value: mapPeriodLabel(period) },
    { title: "مجموع:", value: formatPrice(monthlyTotal, true) },
    { title: "تخفیف:", value: formatPrice(discount, true) },
    { title: "قابل پرداخت:", value: formatPrice(total, true) },
  ];

  return {
    setPlan,
    setPeriod,
    paymentInfo,
    period,
    plan,
    total,
  };
}

export function usePaymentCheckout({
  discountCode,
  period,
  plan,
}: {
  discountCode?: string;
  plan: PlanKey;
  period: SubPeriod;
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

export function periodMultiplier(
  period: SubPeriod,
  amount: number,
  applyAnnualDiscount: boolean
) {
  if (period === "3-month") amount *= 3;
  if (period === "annual") amount *= 12 * (applyAnnualDiscount ? 0.7 : 1);

  return amount;
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
      amount: 50,
      type: "percent",
      expiresAt: new Date("2026-01-17"),
    },
  ];

  const discount = db.find((d) => d.code === discountCode);

  if (!discount) return { error: "Code Not Found" };
  if (discount.expiresAt < new Date()) return { error: "Code is expired" };

  const total =
    discount.type === "fixed"
      ? Math.max(amount - discount.amount, 0)
      : amount * (1 - discount.amount / 100);

  return { total };
}
