"use server";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@repo/db";

// Server action (the payment form looks the selected user up), so it checks the
// caller like every other action.
export const getUserById = async (id: number) => {
  await requireAdmin();
  return await prisma.user.findFirst({ where: { id } });
};
