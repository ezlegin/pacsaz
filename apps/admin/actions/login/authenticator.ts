"use server";

import { signIn } from "@repo/auth";

export const authenticator = async (email: string, password: string) => {
  try {
    const response = await signIn("admin-login", {
      email,
      password,
      redirect: false,
    });

    if (response?.error) return { error: "Invalid credentials" };

    return { success: "Login Success, Welcome!" };
  } catch (error) {
    return { error };
  }
};
