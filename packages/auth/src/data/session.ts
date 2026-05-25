"use server";

import { prisma } from "@repo/db";
import { auth } from "../auth";

export const getSessionUser = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await prisma.user.findFirst({
    where: { id: +userId },
  });

  if (!user) return null;

  const plan = await prisma.plan.findFirst({
    where: { userId: +userId, endsAt: { gte: new Date() }, status: "active" },
  });

  return { ...user, plan };
};
