import { PlanKey } from "@repo/lib/data/plans";

export function mapPlanLevel(userPlan: PlanKey) {
  if (userPlan === "standard") return 1;
  if (userPlan === "pro") return 2;
  return 3;
}
