"use server";

import { prisma } from "@repo/db";

export const getAdminById = async (id: number) => {
  return await prisma.admin.findFirst({
    where: { id },
  });
};

export const getAdminByEmail = async (email: string) => {
  return await prisma.admin.findFirst({
    where: {
      email,
    },
  });
};
