"use server";

import { serverErrorMessage } from "@/data/consts";
import { SaveDielineFormType } from "@/lib/validatoinSchema";
import { DimensionType, prisma } from "@repo/db";
import { MaterialKey } from "@repo/store/data/types";

export interface Settings {
  width: number;
  length: number;
  height: number;
  material: MaterialKey;
  bleed: number;
  dimensionType: DimensionType;
  thickness: number;
}

export const createDownloadHistory = async (
  slug: string,
  settings: Settings,
) => {
  const { bleed, width, height, length, dimensionType, material, thickness } =
    settings;
  try {
    const existingDieline = await prisma.dieline.findFirst({ where: { slug } });
    if (!existingDieline) throw new Error("Dieline Not Found.");

    await prisma.downloadHistory.create({
      data: {
        userId: 1, //todo
        dielineId: existingDieline.id,
        settings: {
          create: {
            bleed,
            dimensionType,
            height,
            length,
            width,
            material,
            thickness,
          },
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};

export const createSaveDieline = async (
  data: SaveDielineFormType,
  slug: string,
) => {
  const {
    bleed,
    height,
    length,
    material,
    thickness,
    title,
    width,
    description,
    dimensionType,
  } = data;
  try {
    const existingDieline = await prisma.dieline.findFirst({ where: { slug } });
    if (!existingDieline) throw new Error("Dieline Not Found.");

    await prisma.savedDieline.create({
      data: {
        userId: 1, //todo
        description: description ?? "",
        dielineId: existingDieline.id,
        title,
        settings: {
          create: {
            bleed,
            dimensionType,
            height,
            length,
            material,
            thickness,
            width,
          },
        },
      },
    });

    return { success: "دایلاین با موفقیت ذخیره شد." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};

export const updateSavedDieline = async (
  data: SaveDielineFormType,
  id: number,
) => {
  const {
    bleed,
    height,
    length,
    material,
    thickness,
    title,
    width,
    description,
    dimensionType,
  } = data;
  try {
    const existingDieline = await prisma.savedDieline.findFirst({
      where: { id },
    });
    if (!existingDieline) throw new Error("Saved Dieline Not Found.");

    await prisma.savedDieline.update({
      where: { id },
      data: {
        title,
        description,
        settings: {
          update: {
            data: {
              bleed,
              dimensionType,
              height,
              length,
              material,
              thickness,
              width,
            },
          },
        },
      },
    });

    return { success: "قالب با موفقیت ذخیره شد." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};

export const deleteSavedDieline = async (id: number) => {
  try {
    const existingDieline = await prisma.savedDieline.findFirst({
      where: { id },
    });
    if (!existingDieline) throw new Error("Saved Dieline Not Found.");

    await prisma.savedDieline.delete({
      where: { id },
    });

    return { success: "قالب با موفقیت حذف شد." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};
