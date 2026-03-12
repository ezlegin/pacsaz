"use server";

import { prisma } from "@repo/db";

export const getUserById = async (id: number) => {
  return await prisma.user.findFirst({ where: { id } });
};
