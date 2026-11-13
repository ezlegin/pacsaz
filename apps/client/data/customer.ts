"use server";

import { getSessionUser } from "@repo/auth/session";
import { prisma } from "@repo/db";

/** The signed-in user's own customer only; anyone else's reads as missing. */
export const getCustomerById = async (id: number) => {
  const user = await getSessionUser();
  if (!user) return null;
  return await prisma.customer.findFirst({ where: { id, userId: user.id } });
};
