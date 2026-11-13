"use server";

import { serverErrorMessage } from "@/data/consts";
import { CustomerFormType } from "@/lib/validatoinSchema";
import { getSessionUser } from "@repo/auth/session";
import { prisma } from "@repo/db";

/**
 * The customer list is a premium feature, and a customer belongs to the user
 * who added it. Every action checks both on the server; the panel page alone
 * is not a gate (actions can be called directly).
 */
const premiumUser = async () => {
  const user = await getSessionUser();
  if (!user) return { error: "ابتدا وارد شوید." as string, user: null };
  if (!user.plan?.isPremium) return { error: "فهرست مشتریان در پلن شما فعال نیست." as string, user: null };
  return { error: null, user };
};

export const createCustomer = async (data: CustomerFormType) => {
  try {
    const gate = await premiumUser();
    if (!gate.user) return { error: gate.error ?? "" };
    const { user } = gate;

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
    const gate = await premiumUser();
    if (!gate.user) return { error: gate.error ?? "" };
    const owned = await prisma.customer.updateMany({ where: { id, userId: gate.user.id }, data });
    if (owned.count === 0) return { error: "مشتری یافت نشد." };

    return { success: "مشتری با مفوقیت بروزرسانی شد." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};

export const deleteCustomer = async (id: number) => {
  try {
    // Deleting needs no plan: a lapsed subscriber may still clear their list.
    const user = await getSessionUser();
    if (!user) return { error: "ابتدا وارد شوید." };
    const owned = await prisma.customer.deleteMany({ where: { id, userId: user.id } });
    if (owned.count === 0) return { error: "مشتری یافت نشد." };

    return { success: "مشتری با مفوقیت حذف شد." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};
