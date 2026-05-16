"use server";

import { serverErrorMessage } from "@/data/consts";
import { CouponFormType } from "@/lib/validationSchema/validatoinSchema";
import { prisma } from "@repo/db";

export const createCoupon = async (data: CouponFormType) => {
  const { amount, code, expiresAt, limit, plans, type } = data;

  try {
    const existingCoupon = await prisma.coupon.findUnique({ where: { code } });
    if (existingCoupon) return { error: "Coupon Code Should be Unique." };

    await prisma.coupon.create({
      data: {
        amount: +amount,
        code,
        expiresAt,
        type,
        limit: +limit,
        tarrif: {
          connect: plans.map((id) => ({ id: +id })),
        },
      },
    });

    return { success: "Coupon Created Successfully." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};

export const updateCoupon = async (data: CouponFormType, id: number) => {
  const { amount, code, expiresAt, limit, plans, type } = data;

  try {
    const existingCoupon = await prisma.coupon.findFirst({
      where: { code, id: { not: id } },
    });
    if (existingCoupon) return { error: "Coupon Code Should be Unique." };

    await prisma.coupon.update({
      where: { id },
      data: {
        amount: +amount,
        code,
        expiresAt,
        type,
        limit: +limit,
        tarrif: {
          connect: plans.map((id) => ({ id: +id })),
        },
      },
    });

    return { success: "Coupon Updated Successfully." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};

export const deleteCoupon = async (id: number) => {
  try {
    const existingPaymentsForThisCoupon = await prisma.payment.findFirst({
      where: { couponId: id },
    });
    if (existingPaymentsForThisCoupon)
      return {
        error:
          "Can't Delete this Coupon Because the Copoun is used by at least one paymenet.",
      };

    await prisma.coupon.delete({ where: { id } });

    return { success: "Coupon Deleted Successfull.y" };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};
