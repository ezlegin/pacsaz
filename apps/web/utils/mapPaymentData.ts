import { mapPeriodLabel, mapUserPlanTitle } from "@/data/user";
import { useMemo } from "react";
import { formatPrice } from "./formatPrice";
import { SubPeriod } from "@/components/SubscriptionList";
import { PlanKey } from "@/data/plan";
import { CheckoutInfo } from "@/hooks/usePaymentCheckout";

export function mapPaymentData(
  period: SubPeriod,
  plan: PlanKey,
  checkoutInfo: CheckoutInfo
) {
  return useMemo(
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
}
