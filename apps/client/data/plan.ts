"use server";

import { prisma } from "@repo/db";

export const getUserPlan = async (userId: number | undefined) => {
  if (!userId) return null;
  return await prisma.plan.findFirst({
    where: { userId, endsAt: { gte: new Date() }, status: "active" },
  });
};
