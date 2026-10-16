import { Coupon } from "@repo/db";

/**
 * Lifecycle of a campaign coupon, derived rather than stored.
 *
 * The database only records the coupon itself (`createdAt`, `expiresAt`, `used`,
 * `limit`); "is it still worth using?" also depends on the current time, so the
 * admin report computes it on read instead of keeping a denormalised column in
 * sync from a cron job.
 */
export type CampaignState = "active" | "exhausted" | "expired";

export const getCampaignState = (coupon: Coupon, now = new Date()): CampaignState => {
  if (coupon.expiresAt.getTime() <= now.getTime()) return "expired";
  if (coupon.limit !== null && coupon.used >= coupon.limit) return "exhausted";
  return "active";
};

export const campaignStateLabel: Record<CampaignState, string> = {
  active: "Active",
  exhausted: "Used up",
  expired: "Expired",
};

/**
 * Tailwind classes for the state badge. Kept next to the labels so a new state
 * cannot be added without deciding how it looks.
 */
export const campaignStateClassName: Record<CampaignState, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  exhausted: "bg-amber-50 text-amber-700 border-amber-200",
  expired: "bg-muted text-muted-foreground border-border",
};

/** Share of the coupon's capacity that was actually redeemed, 0–100. */
export const redemptionPercent = (coupon: Coupon) => {
  if (!coupon.limit) return 0;
  return Math.min(100, Math.round((coupon.used / coupon.limit) * 100));
};
