import type { Coupon, PlanPeriod, Price, Tarrif } from "@repo/db";

export type Quote = { amount: number; discount: number; total: number };

/**
 * What a plan costs for a period with an optional coupon. The one place the
 * price is worked out: checkout shows it and `createPayment` charges it, so the
 * browser can never choose what it pays. Returns a Persian error for a coupon
 * that does not apply.
 */
export function quote(
  tarrif: Tarrif & { price: Price | null },
  period: PlanPeriod,
  coupon?: (Coupon & { tarrif: { key: string }[] }) | null,
): Quote | { error: string } {
  if (!tarrif.price) return { error: "این پلن فعلاً قابل خرید نیست." };
  const amount = tarrif.price[period];
  if (!coupon) return { amount, discount: 0, total: amount };

  if (coupon.expiresAt < new Date()) return { error: "کد تخفیف منقضی شده است." };
  if (coupon.limit && coupon.used >= coupon.limit)
    return { error: "این کد تخفیف به حداکثر تعداد استفاده رسیده است." };
  if (coupon.tarrif.length > 0 && !coupon.tarrif.some((t) => t.key === tarrif.key))
    return { error: "این کد تخفیف برای این پلن اشتراک معتبر نمی باشد." };

  const raw = coupon.type === "fixed" ? coupon.amount : (amount * coupon.amount) / 100;
  const discount = Math.min(amount, Math.max(0, raw));
  return { amount, discount, total: amount - discount };
}
