"use server";

import { prisma } from "@repo/db";

export const getCouponByCode = async (code: string) => {
  return await prisma.coupon.findUnique({
    where: { code },
    include: { tarrif: { select: { key: true } } },
  });
};
