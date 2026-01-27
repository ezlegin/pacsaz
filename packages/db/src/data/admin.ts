"use server";

import { prisma } from "@repo/db";

export const getAdminById = async (
  id: number,
  widthPassword: boolean = false
) => {
  return await prisma.admin.findFirst({
    where: { id },
    omit: {
      password: !widthPassword,
    },
  });
};

export const getAdminByEmail = async (
  email: string,
  widthPassword: boolean = false
) => {
  return await prisma.admin.findFirst({
    where: {
      email,
    },
    omit: {
      password: !widthPassword,
    },
  });
};
