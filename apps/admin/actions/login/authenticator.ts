"use server";

import { signIn } from "@repo/auth";
import { clientIp, rateLimit } from "@repo/db/data/rateLimit";
import { headers } from "next/headers";

export const authenticator = async (email: string, password: string) => {
  try {
    // 10 tries per IP per 15 minutes. Here, not only in verifyLogin, because
    // this export is itself a public action. The provider also limits per email.
    const limit = await rateLimit(`admin-login:ip:${clientIp(await headers())}`, 10, 900);
    if (!limit.ok) return { error: "Too many attempts. Try again later." };

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
