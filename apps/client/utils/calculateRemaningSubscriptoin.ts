import { Plan } from "@repo/db";
import { formatDistance } from "date-fns";

export function calculateRemaningSubscription(plan: Plan) {
  const distande = formatDistance(plan.endsAt, plan.startedAt);
  return parseInt(distande);
}
