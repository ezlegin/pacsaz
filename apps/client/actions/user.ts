"use server";

import { serverErrorMessage } from "@/data/consts";
import { ProfileFormType } from "@/lib/validatoinSchema";
import { prisma } from "@repo/db";

export const updateUserProfile = async (data: ProfileFormType, id: number) => {
  try {
    const existingUser = await prisma.user.findFirst({ where: { id } });
    if (!existingUser) return { error: "User Not Found." };

    await prisma.user.update({
      where: { id },
      data,
    });

    return { success: "کاربر با موفقیت به روزرسانی شد." };
  } catch (error) {
    console.log(error);
    return { error: serverErrorMessage };
  }
};
