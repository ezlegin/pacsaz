"use server";

import { TarrifFormType } from "@/lib/validationSchema/validatoinSchema";
import { prisma } from "@repo/db";

export const createTarrif = async (data: TarrifFormType) => {
  const {
    key,
    description,
    fairDownload,
    isRecommended,
    price,
    selectedFeatures,
    shortDescription,
    title,
  } = data;

  try {
    const existingTarrifByKey = await prisma.tarrif.findUnique({
      where: { key },
    });
    if (existingTarrifByKey)
      return { error: `There is already a tarrif by the key "${key}"` };

    const recommendedFeature = await prisma.tarrif.findFirst({
      where: { isRecommended: true },
    });
    if (recommendedFeature)
      return { error: "There is already a tarrif with Recommended Label." };

    await prisma.tarrif.create({
      data: {
        description,
        isRecommended,
        key,
        shortDescription,
        title,
        fairDownload: {
          create: {
            monthly: +fairDownload.monthly,
            threeMonth: +fairDownload.threeMonth,
            annual: +fairDownload.annual,
          },
        },
        price: {
          create: {
            monthly: +price.monthly,
            threeMonth: +price.threeMonth,
            annual: +price.annual,
          },
        },
        features: {
          connect: selectedFeatures.map((f) => ({ id: +f })),
        },
      },
    });

    return { success: "Tarrif Created Successfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).name };
  }
};

export const updateTarrif = async (data: TarrifFormType, id: number) => {
  const {
    key,
    description,
    fairDownload,
    isRecommended,
    price,
    selectedFeatures,
    shortDescription,
    title,
  } = data;

  try {
    const existingTarrif = await prisma.tarrif.findUnique({ where: { id } });
    if (!existingTarrif) return { error: "Tarrif not found." };

    const existingTarrifByKey = await prisma.tarrif.findFirst({
      where: { key, id: { not: id } },
    });
    if (existingTarrifByKey)
      return { error: `There is already a tarrif by the key "${key}"` };

    const recommendedFeature = await prisma.tarrif.findFirst({
      where: { isRecommended: true, id: { not: id } },
    });
    if (recommendedFeature)
      return { error: "There is already a tarrif with Recommended Label." };

    await prisma.tarrif.update({
      where: { id },
      data: {
        description,
        isRecommended,
        key,
        shortDescription,
        title,
        fairDownload: {
          update: {
            monthly: +fairDownload.monthly,
            threeMonth: +fairDownload.threeMonth,
            annual: +fairDownload.annual,
          },
        },
        price: {
          update: {
            monthly: +price.monthly,
            threeMonth: +price.threeMonth,
            annual: +price.annual,
          },
        },
        features: {
          set: selectedFeatures.map((f) => ({ id: +f })),
        },
      },
    });

    return { success: "Tarrif Updated Successfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).name };
  }
};
