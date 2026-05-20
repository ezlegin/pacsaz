"use server";

import {
  DielineMetadataFormType,
  DielineUpdateFormType,
} from "@/lib/validationSchema/validatoinSchema";
import { prisma } from "@repo/db";
import { materials as allMats } from "@repo/store/data/dieline";

export const createDieline = async (data: DielineMetadataFormType) => {
  const {
    slug,
    title,
    bleed,
    dimensionTypes,
    materials,
    defaultDimensions,
    minDimensions,
    categoryByModel,
    categoryByUsage,
  } = data;

  try {
    const existingDieline = await prisma.dieline.findFirst({ where: { slug } });
    if (existingDieline) {
      return { error: "Slug Should Be Unique." };
    }

    const defaultMaterial = materials.split(",")[0]!;
    await prisma.dieline.create({
      data: {
        slug,
        title,
        minHeight: minDimensions.height,
        minLength: minDimensions.length,
        minWidth: minDimensions.width,
        dimensionTypes,
        materials,
        specification: JSON.stringify({
          shapes: {},
          rulers: [],
          models: [],
        }),
        variable: JSON.stringify([]),
        categoryByModel: {
          connect: categoryByModel.map((i) => ({ slug: i })),
        },
        categoryByUsage: {
          connect: categoryByUsage.map((i) => ({ slug: i })),
        },
        settings: {
          create: {
            material: materials.split(",")[0]!, //todo
            dimensionType: "manufacture", // todo
            thickness:
              allMats.find((m) => m.value === defaultMaterial)?.thickness ??
              0.5,
            bleed: +bleed,
            height: defaultDimensions.height,
            length: defaultDimensions.length,
            width: defaultDimensions.width,
          },
        },
      },
    });

    return { success: "Dieline Saved Successfully.", slug };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};

export const updateDieline = async (
  data: DielineMetadataFormType,
  id: number,
) => {
  const {
    slug,
    title,
    bleed,
    dimensionTypes,
    materials,
    defaultDimensions,
    minDimensions,
    categoryByModel,
    categoryByUsage,
  } = data;

  try {
    const existingDieline = await prisma.dieline.findFirst({
      where: { slug, id: { not: id } },
    });
    if (existingDieline) {
      return { error: "Slug Should Be Unique." };
    }

    const defaultMaterial = materials.split(",")[0]!;
    await prisma.dieline.update({
      where: { id },
      data: {
        minHeight: minDimensions.height,
        minLength: minDimensions.length,
        minWidth: minDimensions.width,
        materials,
        dimensionTypes,

        slug,
        title,
        categoryByModel: {
          set: categoryByModel.map((i) => ({ slug: i })),
        },
        categoryByUsage: {
          set: categoryByUsage.map((i) => ({ slug: i })),
        },
        settings: {
          update: {
            material: materials.split(",")[0]!, // todo
            dimensionType: "manufacture", // todo
            thickness:
              allMats.find((m) => m.value === defaultMaterial)?.thickness ??
              0.5,
            bleed: +bleed,
            height: defaultDimensions.height,
            length: defaultDimensions.length,
            width: defaultDimensions.width,
          },
        },
      },
    });

    return { success: "Dieline Settings Updated Successfully.", slug };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};

export const saveDielineChanges = async (
  data: DielineUpdateFormType,
  id: number,
) => {
  const { specification, variable } = data;
  try {
    const existingDieline = await prisma.dieline.findFirst({ where: { id } });
    if (!existingDieline) throw new Error("Dieline Not Found.");

    await prisma.dieline.update({
      where: { id },
      data: {
        specification,
        variable,
      },
    });

    return { success: "Dieline Saved Successfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};

export const deleteDieline = async (id: number) => {
  try {
    const existingDieline = await prisma.dieline.findFirst({ where: { id } });
    if (!existingDieline) throw new Error("Dieline Not Found.");

    await prisma.dieline.delete({ where: { id } });

    return { success: "Dieline Deleted Successfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};

export const setDielineStatus = async (status: boolean, id: number) => {
  try {
    await prisma.dieline.update({
      where: { id },
      data: { active: status },
    });

    const statusLabel = status ? "Active" : "Inactive";

    return { success: `Dieline Set ${statusLabel}` };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};
