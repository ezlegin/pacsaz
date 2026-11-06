import { Plan, PlanKey, PlanPeriod } from "@repo/db";
import { addMonths } from "date-fns";

/** Plan titles as the client site shows them (Persian). */
export const planTitle: Record<PlanKey, string> = {
  standard: "استاندارد",
  pro: "حرفه‌ای",
  organization: "سازمانی",
};

export const planLevel: Record<PlanKey, number> = {
  standard: 1,
  pro: 2,
  organization: 3,
};

export const periodMonths: Record<PlanPeriod, number> = {
  monthly: 1,
  threeMonth: 3,
  annual: 12,
};

export const planEndsAt = (from: Date, period: PlanPeriod) =>
  addMonths(from, periodMonths[period]);

/**
 * What a subscription really is right now. `status` is only the switch an admin
 * (or a payment) sets; a plan past `endsAt` is over whatever the switch says,
 * which is how the client's `getSessionUser` reads it too.
 */
export type PlanState = "active" | "expired" | "inactive";

export const getPlanState = (
  plan: Pick<Plan, "status" | "endsAt">,
  now = new Date(),
): PlanState => {
  if (plan.status !== "active") return "inactive";
  return plan.endsAt < now ? "expired" : "active";
};
