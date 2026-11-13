"use server";

import { serverErrorMessage } from "@/data/consts";
import {
  onboardingFormSchema,
  OnboardingFormType,
  profileFormSchema,
  ProfileFormType,
} from "@/lib/validatoinSchema";
import { getSessionUser } from "@repo/auth/session";
import { notifyWelcome } from "@/lib/notifications/send";
import { prisma } from "@repo/db";

/**
 * Both actions change the signed-in user only. They used to take the user's id
 * or phone number from the browser, which let anyone rewrite anyone's profile.
 * `id` is kept for the callers but ignored.
 */
export const updateUserProfile = async (data: ProfileFormType, _id?: number) => {
  try {
    const user = await getSessionUser();
    if (!user) return { error: "ابتدا وارد شوید." };
    const parsed = profileFormSchema.safeParse(data);
    if (!parsed.success) return { error: "اطلاعات وارد شده معتبر نیست." };

    await prisma.user.update({
      where: { id: user.id },
      data: parsed.data,
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
  const parsed = onboardingFormSchema.safeParse(data);
  if (!parsed.success) return { error: "اطلاعات وارد شده معتبر نیست." };
  const { email, firstName, lastName, usageGoal, userType } = parsed.data;
  try {
    const session = await getSessionUser();
    const phoneNumber = session?.phoneNumber ?? "";
    const existingUser = session;
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
