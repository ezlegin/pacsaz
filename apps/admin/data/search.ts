"use server";

import { prisma, Prisma } from "@repo/db";

export const searchUsers = async (query: string) => {
  const where: Prisma.UserWhereInput = query
    ? {
        OR: [
          { email: { contains: query } },
          { phoneNumber: { contains: query } },
          { fullName: { contains: query } },
        ],
      }
    : {};

  return await prisma.user.findMany({
    where,
    take: 5,
  });
};
