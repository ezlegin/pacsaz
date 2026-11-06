"use server";

import { ActionResult, actionError } from "@/lib/actionError";
import { requireAdmin } from "@/lib/session";
import {
  AdminFormType,
  adminFormSchema,
} from "@/lib/validationSchema/validatoinSchema";
import { prisma } from "@repo/db";
import bcrypt from "bcrypt";

const invalid = { error: "Please check the form fields." } as const;

export const createAdmin = async (data: AdminFormType): Promise<ActionResult> => {
  try {
    await requireAdmin();

    const parsed = adminFormSchema.safeParse(data);
    if (!parsed.success) return invalid;
    const { email, phoneNumber, fullName, password } = parsed.data;

    if (!password) return { error: "A password is required for a new admin." };

    const existingAdmin = await prisma.admin.findFirst({
      where: { OR: [{ email }, { phoneNumber }] },
    });
    if (existingAdmin)
      return { error: "There is already an admin with this email or phone number." };

    await prisma.admin.create({
      data: {
        email,
        phoneNumber,
        fullName,
        password: await bcrypt.hash(password, 10),
      },
    });

    return { success: "Admin created." };
  } catch (error) {
    return { error: actionError(error) };
  }
};

export const updateAdmin = async (
  data: AdminFormType,
  id: number,
): Promise<ActionResult> => {
  try {
    await requireAdmin();

    const parsed = adminFormSchema.safeParse(data);
    if (!parsed.success) return invalid;
    const { email, fullName, phoneNumber, password } = parsed.data;

    const existingAdmin = await prisma.admin.findUnique({ where: { id } });
    if (!existingAdmin) return { error: "Admin not found." };

    const taken = await prisma.admin.findFirst({
      where: { OR: [{ email }, { phoneNumber }], id: { not: id } },
    });
    if (taken)
      return { error: "Another admin already uses this email or phone number." };

    await prisma.admin.update({
      where: { id },
      data: {
        email,
        fullName,
        phoneNumber,
        // An empty password field means "keep the current one".
        ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
      },
    });

    return { success: "Admin updated." };
  } catch (error) {
    return { error: actionError(error) };
  }
};

export const deleteAdmin = async (id: number): Promise<ActionResult> => {
  try {
    const me = await requireAdmin();

    // Deleting yourself ends your own session mid-action, and deleting the last
    // admin locks everyone out of the panel.
    if (me.id === id) return { error: "You can't delete your own account." };
    if ((await prisma.admin.count()) <= 1)
      return { error: "The last admin can't be deleted." };

    await prisma.admin.delete({ where: { id } });

    return { success: "Admin deleted." };
  } catch (error) {
    return { error: actionError(error) };
  }
};
