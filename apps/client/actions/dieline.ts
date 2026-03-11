"use server";

import { Settings } from "@/components/forms/SaveDielineForm";
import { prisma } from "@repo/db";

export const createDownloadRecord = async (
  slug: string,
  settings: Omit<Settings, "dimension" | "material"> & {
    width: number;
    height: number;
    length: number;
    material: string;
  },
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
