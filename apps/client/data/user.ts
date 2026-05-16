"use server";

import { prisma } from "@repo/db";

const authUserId = 1; // TODO

export const getSessionUser = async () => {
  if (!authUserId) return null;

  return await prisma.user.findFirst({
    where: { id: authUserId },
  });
};
