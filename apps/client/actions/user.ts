"use server";

import { serverErrorMessage } from "@/data/consts";
import { OnboardingFormType, ProfileFormType } from "@/lib/validatoinSchema";
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
    console.error(error);
    return { error: serverErrorMessage };
  }
};

export const updateUserDataFromOnboardingForm = async (
  data: OnboardingFormType,
) => {
  const { email, firstName, lastName, usageGoal, userType, phoneNumber } = data;
  try {
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });
    if (!existingUser)
      throw new Error("کاربری با مشخصات شما وجود ندارد. لطفا مجددا وارد شوید.");

    await prisma.user.update({
      where: { phoneNumber },
      data: {
        userType,
        usageGoal,
        lastName: lastName && lastName.length > 0 ? lastName : null,
        firstName,
        fullName: `${firstName} ${lastName}`,
        email,
        onboardingCompleted: true,
      },
    });

    return { success: "به جمع کاربران پک ساز خوش آمدید!" };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};
