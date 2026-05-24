"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/db";

const getUserById = async (id: number) => {
  return await prisma.user.findFirst({
    where: { id },
  });
};
export const getSessionUser = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  return userId ? getUserById(+userId) : null;
};
