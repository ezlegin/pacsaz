import { PlanKey } from "@repo/db";

export function mapPlanTitle(userPlan: PlanKey) {
  if (userPlan === "standard") return "استاندارد";
  if (userPlan === "pro") return "حرفه‌ای";
  return "سازمانی";
}
