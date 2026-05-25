"use server";

import { serverErrorMessage } from "@/data/consts";
import { CustomerFormType } from "@/lib/validatoinSchema";
import { getSessionUser } from "@repo/auth/session";
import { prisma } from "@repo/db";

export const createCustomer = async (data: CustomerFormType) => {
  try {
    const user = await getSessionUser();
    if (!user) throw new Error("User Not Found.");

    await prisma.customer.create({
      data: {
        ...data,
        userId: user.id,
      },
    });

    return { success: "مشتری با مفوقیت ایجاد شد." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};

export const updateCustomer = async (data: CustomerFormType, id: number) => {
  try {
    await prisma.customer.update({ where: { id }, data });

    return { success: "مشتری با مفوقیت بروزرسانی شد." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};

export const deleteCustomer = async (id: number) => {
  try {
    await prisma.customer.delete({ where: { id } });

    return { success: "مشتری با مفوقیت حذف شد." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};
