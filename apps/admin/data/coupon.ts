"use server";

import { requireAdmin } from "@/lib/session";
import { prisma } from "@repo/db";

// Server action (the payment form previews a coupon), so it checks the caller.
export const getCouponByCode = async (code: string) => {
  await requireAdmin();
  return await prisma.coupon.findUnique({
    where: { code },
    include: { tarrif: { select: { key: true } } },
  });
};
