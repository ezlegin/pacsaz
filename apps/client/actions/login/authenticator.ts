"use server";

import { signIn } from "@repo/auth";
import { prisma } from "@repo/db";

export const authenticator = async (phoneNumber: string) => {
  const response = await signIn("user-login", {
    phoneNumber,
    redirect: false,
  });

  if (response?.error) return { error: "Invalid credentials" };

  // The caller decides where to go next: a new account still has onboarding ahead.
  const user = await prisma.user.findUnique({
    where: { phoneNumber },
    select: { onboardingCompleted: true },
  });

  return {
    success: "ورود موفقیت آمیز. خوش آمدید!",
    onboardingCompleted: !!user?.onboardingCompleted,
  };
};
