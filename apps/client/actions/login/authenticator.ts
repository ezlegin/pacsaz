"use server";

import { signIn } from "@repo/auth";
import { prisma } from "@repo/db";

/**
 * Signs in with the SMS code. The code is checked inside the `user-login`
 * provider itself (see `client.config.ts`), so there is no way to sign in with
 * a phone number alone: this action used to take only the number, after a
 * separate verify step the caller could simply skip.
 */
export const signInWithCode = async (phoneNumber: string, code: string) => {
  try {
    await signIn("user-login", { phoneNumber, code, redirect: false });
  } catch (error) {
    // Auth.js errors carry a `type` (CredentialsSignin for a wrong or used code).
    if (error && typeof error === "object" && "type" in error) return { error: "کد معتبر نمی باشد." };
    console.error(error);
    return { error: "ورود ناموفق بود. دوباره تلاش کنید." };
  }

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
