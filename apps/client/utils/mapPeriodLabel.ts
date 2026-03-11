import { PlanPeriod } from "@repo/lib/data/plans";

export function mapPeriodLabel(period: PlanPeriod) {
  switch (period) {
    case "monthly":
      return "ماهیانه";
    case "threeMonth":
      return "3 ماهه";
    default:
      return "سالیانه";
  }
}
