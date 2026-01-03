import { PaymentQuery } from "@/components/PaymentGrid";
import { SubPeriod } from "@/components/SubscriptionList";
import { PlanKey, plans } from "@/data/subscription";
import { mapPeriodLabel, testUser } from "@/data/user";
import { formatPrice } from "@/utils/formatPrice";
import { useState } from "react";

export function useUpgradeSubscriptionCheckout({
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
