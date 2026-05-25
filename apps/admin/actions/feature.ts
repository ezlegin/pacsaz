"use server";

import { FeatureFormType } from "@/lib/validationSchema/validatoinSchema";
import { prisma } from "@repo/db";

export const createFeature = async (data: FeatureFormType) => {
  try {
    await prisma.tarrifFeature.create({
      data: { title: data.title, type: data.type },
    });

    return { success: "Feature Created Successull." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).name };
  }
};

export const updateFeature = async (data: FeatureFormType, id: number) => {
  try {
    const existingFeature = await prisma.tarrifFeature.findFirst({
      where: { id },
    });
    if (!existingFeature) throw new Error("Feature not found.");

    await prisma.tarrifFeature.update({
      where: { id },
      data,
    });

    return { success: "Feature Updated Successull." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).name };
  }
};

export const deleteFeature = async (id: number) => {
  try {
    const existingFeature = await prisma.tarrifFeature.findFirst({
      where: { id },
    });
    if (!existingFeature) throw new Error("Feature not found.");

    await prisma.tarrifFeature.delete({ where: { id } });

    return { success: "Feature Deleted Successull." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).name };
  }
};
