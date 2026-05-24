"use server";

import { signIn } from "@repo/auth";

export const authenticator = async (phoneNumber: string) => {
  const response = await signIn("user-login", {
    phoneNumber,
    redirect: false,
  });

  if (response?.error) return { error: "Invalid credentials" };

  return { success: "ورود موفقیت آمیز. خوش آمدید!" };
};
