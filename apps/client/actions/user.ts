"use server";

import { serverErrorMessage } from "@/data/consts";
import { OnboardingFormType, ProfileFormType } from "@/lib/validatoinSchema";
import { notifyWelcome } from "@/lib/notifications/send";
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

    const updatedUser = await prisma.user.update({
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

    // The welcome email is sent here rather than at sign-up because the address
    // is only captured by this form; there is nothing to send before it. The
    // notification log makes a repeated onboarding submit a no-op, and a mail
    // failure is logged without failing the user's onboarding.
    await notifyWelcome({
      userId: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
    });

    return { success: "به جمع کاربران پک ساز خوش آمدید!" };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};
