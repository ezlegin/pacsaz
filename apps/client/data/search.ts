"use server";

import { prisma, Prisma } from "@repo/db";

export const searchCustomers = async (query: string) => {
  const where: Prisma.CustomerWhereInput = query
    ? {
        OR: [
          { email: { contains: query } },
          { phoneNumber: { contains: query } },
          { fullName: { contains: query } },
        ],
      }
    : {};

  return await prisma.customer.findMany({
    where,
    take: 5,
  });
};
