"use server";

import { AdminFormType } from "@/lib/validationSchema/validatoinSchema";
import { prisma } from "@repo/db";
import bcrypt from "bcrypt";

export const createAdmin = async (data: AdminFormType) => {
  const { email, phoneNumber, password } = data;

  try {
    const existingAdmin = await prisma.admin.findFirst({
      where: { OR: [{ email }, { phoneNumber }] },
    });
    if (existingAdmin)
      return {
        error: "There is already a admin with this email or phone number.",
      };

    if (!password) return { error: "Password Required." };
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.admin.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    return { success: "Admin Created Succesfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};

export const updateAdmin = async (data: AdminFormType, id: number) => {
  const { email, fullName, phoneNumber, password } = data;
  try {
    const existingAdmin = await prisma.admin.findFirst({ where: { id } });
    if (!existingAdmin)
      return {
        error: "Admin Not Found.",
      };

    await prisma.admin.update({
      where: { id },
      data: {
        email,
        fullName,
        phoneNumber,
      },
    });

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.admin.update({
        where: { id },
        data: {
          password: hashedPassword,
        },
      });
    }

    return { success: "Admin Updated Succesfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};

export const deleteAdmin = async (id: number) => {
  try {
    const existingAdmin = await prisma.admin.findFirst({ where: { id } });
    if (!existingAdmin)
      return {
        error: "Admin Not Found.",
      };

    await prisma.admin.delete({ where: { id } });

    return { success: "Admin Deleted Succesfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};
