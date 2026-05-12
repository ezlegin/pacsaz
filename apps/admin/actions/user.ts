"use server";

import { UserFormType } from "@/lib/validationSchema/validatoinSchema";
import { prisma } from "@repo/db";

export const createUser = async (data: UserFormType) => {
  const { email, phoneNumber, firstName, lastName } = data;

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phoneNumber }] },
    });
    if (existingUser)
      return {
        error: "There is already a user with this email or phone number.",
      };

    await prisma.user.create({
      data: {
        ...data,
        fullName: `${firstName} ${lastName}`,
      },
    });

    return { success: "User Created Succesfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};

export const updateUser = async (data: UserFormType, id: number) => {
  const { firstName, lastName } = data;
  try {
    const existingUser = await prisma.user.findFirst({ where: { id } });
    if (!existingUser)
      return {
        error: "User Not Found.",
      };

    await prisma.user.update({
      where: { id },
      data: {
        ...data,
        fullName: `${firstName} ${lastName}`,
      },
    });

    return { success: "User Updated Succesfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};

export const deleteUser = async (id: number) => {
  try {
    const existingUser = await prisma.user.findFirst({ where: { id } });
    if (!existingUser)
      return {
        error: "User Not Found.",
      };

    await prisma.user.delete({ where: { id } });

    return { success: "User Deleted Succesfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};
