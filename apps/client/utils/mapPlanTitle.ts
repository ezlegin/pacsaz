import { PlanKey } from "@repo/lib/data/plans";

export function mapPlanTitle(userPlan: PlanKey) {
  if (userPlan === "standard") return "استاندارد";
  if (userPlan === "pro") return "حرفه‌ای";
  return "سازمانی";
}
