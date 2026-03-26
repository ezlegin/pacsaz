"use server";

import { prisma } from "@repo/db";

const authUserId = 1; // TODO

export const getSessionUser = async () => {
  if (!authUserId) return null;

  const user = await prisma.user.findFirst({
    where: { id: authUserId },
  });
  if (!user) return null;

  const now = new Date();

  const plan = await prisma.plan.findFirst({
    where: { userId: user.id, endsAt: { gte: now }, startedAt: { lte: now } },
  });

  return {
    ...user,
    plan,
  };
};
