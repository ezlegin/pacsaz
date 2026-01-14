import { PlanKey, PlanPeriod, plans } from "@/data/subscription";

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

function periodMultiplier(
  period: PlanPeriod,
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
