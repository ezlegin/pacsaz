import { CheckoutInfo } from "@/hooks/usePaymentCheckout";
import { PlanKey, PlanPeriod } from "@repo/lib/data/plans";
import { formatPrice } from "@repo/lib/utils/formatPrice";
import { useMemo } from "react";
import { mapUserPlanTitle } from "./mapUserPlanTitle";
import { mapPeriodLabel } from "./mapPeriodLabel";

export function mapPaymentData(
  period: PlanPeriod,
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
