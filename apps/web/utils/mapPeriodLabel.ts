import { PlanPeriod } from "@repo/lib/data/plans";

export function mapPeriodLabel(period: PlanPeriod) {
  if (period === "monthly") return "ماهیانه";
  if (period === "3-month") return "3 ماهه";
  return "سالیانه";
}
