"use server";

import { prisma } from "@repo/db";

//todo: move whole codes to @repo/db
export const getUserByPhoneNumber = async (phoneNumber: string) => {
  return await prisma.user.findFirst({
    where: {
      email: phoneNumber, //todo
    },
  });
};

export const getUserById = async (id: number) => {
  if (!id) return;
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
};
