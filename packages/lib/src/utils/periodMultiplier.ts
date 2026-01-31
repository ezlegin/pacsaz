import { annualPlanDisocunt } from "../data/consts";
import { PlanPeriod } from "../data/plans";

export function periodMultiplier(
  period: PlanPeriod,
  amount: number,
  applyAnnualDiscount: boolean,
  toFixed?: boolean,
) {
  if (period === "threeMonth") amount *= 3;
  if (period === "annual")
    amount *= 12 * (applyAnnualDiscount ? 1 - annualPlanDisocunt : 1);

  return toFixed ? +(amount / 1000).toFixed() * 1000 : amount;
}
