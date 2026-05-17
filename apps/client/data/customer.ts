"use server";

import { prisma } from "@repo/db";

export const getCustomerById = async (id: number) => {
  return await prisma.customer.findFirst({ where: { id } });
};
