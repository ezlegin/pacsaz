"use server";

import { prisma } from "@repo/db";
import { authenticator } from "./authenticator";

export const verifyLogin = async (email: string, password: string) => {
  try {
    const existingAdmin = await prisma.admin.findFirst({ where: { email } });
    if (!existingAdmin) throw new Error("Invalid Credentials.");

    const authRes = await authenticator(email, password);
    if (authRes.error) throw new Error("Invalid Credentials.");

    return { success: authRes.success ?? "Login Success." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};
