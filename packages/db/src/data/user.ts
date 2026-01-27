"use server";

import { prisma } from "@repo/db";

export const getUserByPhoneNumber = async (email: string) => {
  return await prisma.user.findFirst({
    where: {
      email,
    },
  });
};

export const getUserById = async (id: number) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
};
