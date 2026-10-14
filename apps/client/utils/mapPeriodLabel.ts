import { PlanPeriod } from "@repo/db";

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
