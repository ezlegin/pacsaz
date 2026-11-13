import type { Plan } from "@repo/db";

/**
 * Plans that include Customize mode (the paid editor). Checked in the UI for the upsell and again on the
 * server for every save and download.
 */
export const CUSTOMIZE_PLAN_KEYS = ["pro", "organization"] as const;

export function canCustomize(plan: Pick<Plan, "key"> | null | undefined): boolean {
  return !!plan && (CUSTOMIZE_PLAN_KEYS as readonly string[]).includes(plan.key);
}
