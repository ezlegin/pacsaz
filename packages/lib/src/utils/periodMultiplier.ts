import { annualPlanDisocunt } from "../data/consts";
import { PlanPeriod } from "../data/plans";

export function periodMultiplier(
  period: PlanPeriod,
  amount: number,
  applyAnnualDiscount: boolean,
  toFixed?: boolean,
) {
  switch (period) {
    case "threeMonth":
      return (amount *= 3);
    case "annual":
      return (amount *=
        12 * (applyAnnualDiscount ? 1 - annualPlanDisocunt : 1));
    default:
      return toFixed ? +(amount / 1000).toFixed() * 1000 : amount;
  }
}
