"use server";

import { prisma } from "@repo/db";
import { authenticator } from "./authenticator";

export const verifyLogin = async (email: string, password: string) => {
  const message = "Invalid Credentials.";

  try {
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (!existingAdmin) throw new Error(message);

    const authRes = await authenticator(email, password);
    if (authRes.error) throw new Error(message);

    return { success: authRes.success ?? "Login Success." };
  } catch (error) {
    return { error: (error as Error).message };
  }
};
