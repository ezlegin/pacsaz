"use server";

import { ActionResult, actionError } from "@/lib/actionError";
import { planEndsAt, planLevel, planTitle } from "@/lib/plan";
import { requireAdmin } from "@/lib/session";
import {
  PaymentFormType,
  paymentFormSchema,
} from "@/lib/validationSchema/validatoinSchema";
import { PlanKey, PlanPeriod, prisma } from "@repo/db";

type Priced = {
  tarrifId: number;
  fairDownload: number;
  amount: number;
  discountCodeAmount: number;
  total: number;
  couponId: number | null;
  discountCode: string | null;
};

/**
 * Prices a payment on the server from the tariff and the coupon.
 *
 * The form shows the same numbers, but it used to be what got stored, and its
 * edit path applied the coupon to the already discounted total. The coupon is
 * checked like at checkout (expiry, usage limit, allowed plans) only when it is
 * new on this payment: a coupon the payment already carries stays valid after it
 * expires or fills up.
 */
const pricePayment = async (
  planKey: PlanKey,
  period: PlanPeriod,
  code: string,
  currentCouponId: number | null,
): Promise<{ ok: true; value: Priced } | { ok: false; error: string }> => {
  const tarrif = await prisma.tarrif.findUnique({
    where: { key: planKey },
    include: { fairDownload: true, price: true },
  });
  if (!tarrif?.price || !tarrif.fairDownload)
    return { ok: false, error: "This tariff has no price or download limit yet." };

  const amount = tarrif.price[period];
  const base = {
    tarrifId: tarrif.id,
    fairDownload: tarrif.fairDownload[period],
    amount,
  };

  const trimmed = code.trim();
  if (!trimmed)
    return {
      ok: true,
      value: { ...base, discountCodeAmount: 0, total: amount, couponId: null, discountCode: null },
    };

  const coupon = await prisma.coupon.findUnique({
    where: { code: trimmed },
    include: { tarrif: { select: { key: true } } },
  });
  if (!coupon) return { ok: false, error: "The coupon code does not exist." };

  if (coupon.id !== currentCouponId) {
    if (coupon.expiresAt < new Date()) return { ok: false, error: "The coupon has expired." };
    if (coupon.limit !== null && coupon.used >= coupon.limit)
      return { ok: false, error: "The coupon has reached its usage limit." };
    if (coupon.tarrif.length > 0 && !coupon.tarrif.some((t) => t.key === planKey))
      return { ok: false, error: "The coupon is not valid for this plan." };
  }

  const discount =
    coupon.type === "fixed"
      ? Math.min(coupon.amount, amount)
      : Math.min(amount, (amount * coupon.amount) / 100);

  return {
    ok: true,
    value: {
      ...base,
      discountCodeAmount: discount,
      total: amount - discount,
      couponId: coupon.id,
      discountCode: coupon.code,
    },
  };
};

const parse = (data: PaymentFormType) => {
  const parsed = paymentFormSchema.safeParse(data);
  if (!parsed.success) return null;
  const userId = Number(parsed.data.userId);
  if (!Number.isInteger(userId) || userId <= 0) return null;
  return { ...parsed.data, userId };
};

const invalid = { error: "Please check the form fields." } as const;

export const createPayment = async (data: PaymentFormType): Promise<ActionResult> => {
  try {
    await requireAdmin();

    const input = parse(data);
    if (!input) return invalid;
    const { from, period, planKey, status, userId, discountCode } = input;

    if (!(await prisma.user.findUnique({ where: { id: userId } })))
      return { error: "User not found." };

    const priced = await pricePayment(planKey, period, discountCode, null);
    if (!priced.ok) return { error: priced.error };
    const p = priced.value;

    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          amount: p.amount,
          discountCode: p.discountCode,
          discountCodeAmount: p.discountCodeAmount,
          totalDiscount: p.discountCodeAmount,
          total: p.total,
          status,
          method: "admin",
          period,
          tarrif: { connect: { id: p.tarrifId } },
          user: { connect: { id: userId } },
          coupon: p.couponId ? { connect: { id: p.couponId } } : undefined,
          plan: {
            create: {
              title: planTitle[planKey],
              key: planKey,
              level: planLevel[planKey],
              period,
              isPremium: planKey !== "standard",
              fairDownload: p.fairDownload,
              startedAt: from,
              endsAt: planEndsAt(from, period),
              type: "new",
              // Only a successful payment grants the plan; a pending or failed
              // one used to hand out an active subscription too.
              status: status === "success" ? "active" : "inActive",
              userId,
            },
          },
        },
      });

      if (p.couponId)
        await tx.coupon.update({
          where: { id: p.couponId },
          data: { used: { increment: 1 } },
        });
    });

    return { success: "Payment and subscription created." };
  } catch (error) {
    return { error: actionError(error) };
  }
};

export const updatePayment = async (
  data: PaymentFormType,
  id: number,
): Promise<ActionResult> => {
  try {
    await requireAdmin();

    const input = parse(data);
    if (!input) return invalid;
    const { from, period, planKey, status, userId, discountCode } = input;

    const existing = await prisma.payment.findUnique({
      where: { id },
      include: { plan: true },
    });
    if (!existing) return { error: "Payment not found." };

    if (!(await prisma.user.findUnique({ where: { id: userId } })))
      return { error: "User not found." };

    const priced = await pricePayment(planKey, period, discountCode, existing.couponId);
    if (!priced.ok) return { error: priced.error };
    const p = priced.value;

    const planData = {
      title: planTitle[planKey],
      key: planKey,
      level: planLevel[planKey],
      period,
      isPremium: planKey !== "standard",
      fairDownload: p.fairDownload,
      startedAt: from,
      endsAt: planEndsAt(from, period),
      status: status === "success" ? ("active" as const) : ("inActive" as const),
      userId,
    };

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id },
        data: {
          amount: p.amount,
          discountCode: p.discountCode,
          discountCodeAmount: p.discountCodeAmount,
          totalDiscount: p.discountCodeAmount,
          total: p.total,
          status,
          // The period and tariff used to stay as they were while the plan
          // changed, so the payment and its plan disagreed.
          period,
          tarrif: { connect: { id: p.tarrifId } },
          user: { connect: { id: userId } },
          coupon: p.couponId ? { connect: { id: p.couponId } } : { disconnect: true },
          plan: {
            // A payment can lack a plan (one that failed at the gateway).
            upsert: {
              create: { ...planData, type: "new" },
              update: planData,
            },
          },
        },
      });

      // Count a coupon once per payment: only when it changes. Every save used
      // to add one more use.
      if (existing.couponId !== p.couponId) {
        if (existing.couponId)
          await tx.coupon.updateMany({
            where: { id: existing.couponId, used: { gt: 0 } },
            data: { used: { decrement: 1 } },
          });
        if (p.couponId)
          await tx.coupon.update({
            where: { id: p.couponId },
            data: { used: { increment: 1 } },
          });
      }
    });

    return { success: "Payment and subscription updated." };
  } catch (error) {
    return { error: actionError(error) };
  }
};

export const deletePayment = async (id: number): Promise<ActionResult> => {
  try {
    await requireAdmin();

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { plan: { include: { _count: { select: { histories: true } } } } },
    });
    if (!payment) return { error: "Payment not found." };

    // Downloads point at the plan and keep the customer's history; the database
    // refuses to drop them with it.
    const downloads = payment.plan?._count.histories ?? 0;
    if (downloads > 0)
      return {
        error: `The subscription of this payment has ${downloads} downloads, so it can't be deleted. Deactivate the subscription instead.`,
      };

    await prisma.$transaction(async (tx) => {
      // The plan goes with the payment (onDelete: Cascade). Deleting it again
      // afterwards is what made every delete fail and roll back.
      await tx.payment.delete({ where: { id } });

      if (payment.couponId)
        await tx.coupon.updateMany({
          where: { id: payment.couponId, used: { gt: 0 } },
          data: { used: { decrement: 1 } },
        });
    });

    return { success: "Payment deleted." };
  } catch (error) {
    return { error: actionError(error) };
  }
};
