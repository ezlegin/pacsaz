"use server";

import { ActionResult, actionError } from "@/lib/actionError";
import { requireAdmin } from "@/lib/session";
import {
  UserFormType,
  userFormSchema,
} from "@/lib/validationSchema/validatoinSchema";
import { prisma } from "@repo/db";

const invalid = { error: "Please check the form fields." } as const;

export const createUser = async (data: UserFormType): Promise<ActionResult> => {
  try {
    await requireAdmin();

    const parsed = userFormSchema.safeParse(data);
    if (!parsed.success) return invalid;
    const { email, phoneNumber, firstName, lastName, userType } = parsed.data;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phoneNumber }] },
    });
    if (existingUser)
      return { error: "There is already a user with this email or phone number." };

    await prisma.user.create({
      data: {
        email,
        phoneNumber,
        firstName,
        lastName,
        userType,
        fullName: `${firstName} ${lastName}`,
      },
    });

    return { success: "User created." };
  } catch (error) {
    return { error: actionError(error) };
  }
};

export const updateUser = async (
  data: UserFormType,
  id: number,
): Promise<ActionResult> => {
  try {
    await requireAdmin();

    const parsed = userFormSchema.safeParse(data);
    if (!parsed.success) return invalid;
    const { email, phoneNumber, firstName, lastName, userType } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) return { error: "User not found." };

    const taken = await prisma.user.findFirst({
      where: { OR: [{ email }, { phoneNumber }], id: { not: id } },
    });
    if (taken)
      return { error: "Another user already uses this email or phone number." };

    await prisma.user.update({
      where: { id },
      data: {
        email,
        phoneNumber,
        firstName,
        lastName,
        userType,
        fullName: `${firstName} ${lastName}`,
      },
    });

    return { success: "User updated." };
  } catch (error) {
    return { error: actionError(error) };
  }
};

export const deleteUser = async (id: number): Promise<ActionResult> => {
  try {
    await requireAdmin();

    // Payments cascade with the user, so deleting someone who ever paid would
    // erase the money history with them. Those accounts stay.
    const payments = await prisma.payment.count({ where: { userId: id } });
    if (payments > 0)
      return {
        error: `This user has ${payments} payment${payments > 1 ? "s" : ""} on record, so the account can't be deleted.`,
      };

    await prisma.user.delete({ where: { id } });

    return { success: "User deleted." };
  } catch (error) {
    return { error: actionError(error) };
  }
};
