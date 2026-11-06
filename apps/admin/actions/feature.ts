"use server";

import { ActionResult, actionError } from "@/lib/actionError";
import { requireAdmin } from "@/lib/session";
import {
  FeatureFormType,
  featureFormSchema,
} from "@/lib/validationSchema/validatoinSchema";
import { prisma } from "@repo/db";

const invalid = { error: "Please check the form fields." } as const;

export const createFeature = async (data: FeatureFormType): Promise<ActionResult> => {
  try {
    await requireAdmin();

    const parsed = featureFormSchema.safeParse(data);
    if (!parsed.success) return invalid;

    await prisma.tarrifFeature.create({ data: parsed.data });

    return { success: "Feature created." };
  } catch (error) {
    return { error: actionError(error) };
  }
};

export const updateFeature = async (
  data: FeatureFormType,
  id: number,
): Promise<ActionResult> => {
  try {
    await requireAdmin();

    const parsed = featureFormSchema.safeParse(data);
    if (!parsed.success) return invalid;

    await prisma.tarrifFeature.update({ where: { id }, data: parsed.data });

    return { success: "Feature updated." };
  } catch (error) {
    return { error: actionError(error) };
  }
};

export const deleteFeature = async (id: number): Promise<ActionResult> => {
  try {
    await requireAdmin();

    await prisma.tarrifFeature.delete({ where: { id } });

    return { success: "Feature deleted." };
  } catch (error) {
    return { error: actionError(error) };
  }
};
