"use server";

import { getSessionUser } from "@repo/auth/session";
import { prisma, Prisma } from "@repo/db";

/**
 * Searches the signed-in user's own customers. It used to search every
 * user's list, and an empty query returned them all to anyone.
 */
export const searchCustomers = async (query: string) => {
  const user = await getSessionUser();
  if (!user) return [];

  const where: Prisma.CustomerWhereInput = {
    userId: user.id,
    ...(query
      ? {
          OR: [
            { email: { contains: query } },
            { phoneNumber: { contains: query } },
            { fullName: { contains: query } },
          ],
        }
      : {}),
  };

  return await prisma.customer.findMany({ where, take: 5 });
};
