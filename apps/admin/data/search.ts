"use server";

import { requireAdmin } from "@/lib/session";
import { prisma, Prisma } from "@repo/db";

// Server action (the user picker of the payment form), so it checks the caller.
export const searchUsers = async (query: string) => {
  await requireAdmin();

  const q = typeof query === "string" ? query.trim() : "";
  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { phoneNumber: { contains: q } },
          { fullName: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  return await prisma.user.findMany({
    where,
    take: 5,
  });
};
