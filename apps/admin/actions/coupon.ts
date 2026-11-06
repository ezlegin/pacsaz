"use server";

import { ActionResult, actionError } from "@/lib/actionError";
import { requireAdmin } from "@/lib/session";
import {
  CouponFormType,
  couponFormSchema,
} from "@/lib/validationSchema/validatoinSchema";
import { prisma } from "@repo/db";

/**
 * Checks the form on the server and turns its strings into the stored shape.
 * A limit of 0 means "no limit" and is stored as null, which is how the rest of
 * the app (the campaign report, the checkout) reads an unlimited coupon.
 */
const toCouponData = (data: CouponFormType) => {
  const parsed = couponFormSchema.safeParse(data);
  if (!parsed.success) return null;
  const { amount, code, expiresAt, limit, plans, type } = parsed.data;

  const value = Number(amount);
  const max = Number(limit);
  if (!Number.isFinite(value) || value <= 0) return null;
  if (type === "percent" && value > 100) return null;
  if (!Number.isInteger(max) || max < 0) return null;

  return {
    code: code.trim(),
    amount: value,
    type,
    expiresAt,
    limit: max === 0 ? null : max,
    plans: plans.map((id) => ({ id: Number(id) })),
  };
};

const invalid = {
  error: "Please check the fields: amount above 0 (at most 100 for percent), limit a whole number.",
} as const;

export const createCoupon = async (data: CouponFormType): Promise<ActionResult> => {
  try {
    await requireAdmin();

    const coupon = toCouponData(data);
    if (!coupon) return invalid;
    const { plans, ...fields } = coupon;

    const existingCoupon = await prisma.coupon.findUnique({ where: { code: fields.code } });
    if (existingCoupon) return { error: "The coupon code must be unique." };

    await prisma.coupon.create({
      data: { ...fields, tarrif: { connect: plans } },
    });

    return { success: "Coupon created." };
  } catch (error) {
    return { error: actionError(error) };
  }
};

export const updateCoupon = async (
  data: CouponFormType,
  id: number,
): Promise<ActionResult> => {
  try {
    await requireAdmin();

    const coupon = toCouponData(data);
    if (!coupon) return invalid;
    const { plans, ...fields } = coupon;

    const existingCoupon = await prisma.coupon.findFirst({
      where: { code: fields.code, id: { not: id } },
    });
    if (existingCoupon) return { error: "The coupon code must be unique." };

    await prisma.coupon.update({
      where: { id },
      data: {
        ...fields,
        // `set`, not `connect`: connect only ever adds, so a plan unticked in
        // the form used to stay on the coupon.
        tarrif: { set: plans },
      },
    });

    return { success: "Coupon updated." };
  } catch (error) {
    return { error: actionError(error) };
  }
};

export const deleteCoupon = async (id: number): Promise<ActionResult> => {
  try {
    await requireAdmin();

    const usedBy = await prisma.payment.count({ where: { couponId: id } });
    if (usedBy > 0)
      return { error: "This coupon was used in a payment, so it can't be deleted." };

    await prisma.coupon.delete({ where: { id } });

    return { success: "Coupon deleted." };
  } catch (error) {
    return { error: actionError(error) };
  }
};
