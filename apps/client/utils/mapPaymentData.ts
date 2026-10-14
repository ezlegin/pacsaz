import { PlanKey, PlanPeriod } from "@repo/db";
import { formatPrice } from "@repo/lib/utils/formatPrice";
import { useMemo } from "react";

/** The checkout payload this helper formats. */
interface CheckoutInfo {
  amount: number;
  discountAmount: number;
  total: number;
}

export function mapPaymentData(
  period: PlanPeriod,
  plan: PlanKey,
  checkoutInfo: CheckoutInfo,
) {
  return useMemo(
    () => [
      { title: "مجموع:", value: formatPrice(checkoutInfo.amount, true) },
      {
        title: "تخفیف:",
        value: formatPrice(checkoutInfo.discountAmount, true),
      },
      { title: "قابل پرداخت:", value: formatPrice(checkoutInfo.total, true) },
    ],
    [plan, period, checkoutInfo],
  );
}
