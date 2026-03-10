"use server";

import { DielineMetadataFormType } from "@/components/forms/DielineMetadataForm";
import { prisma } from "@repo/db";

export const createDieline = async (data: DielineMetadataFormType) => {
  const {
    specification,
    slug,
    title,
    variable,
    bleed,
    defaultDimensions,
    dimensionTypes,
    materials,
    minDimensions,
  } = data;

  try {
    const existingDieline = await prisma.dieline.findFirst({ where: { slug } });
    if (existingDieline) {
      return { error: "Slug Should Be Unique." };
    }

    await prisma.dieline.create({
      data: {
        slug,
        title,
        specification,
        variable,
        settings: {
          create: {
            materials,
            dimensionTypes,
            bleed: +bleed,
            defaultDimension: {
              create: defaultDimensions,
            },
            minDimension: {
              create: minDimensions,
            },
          },
        },
      },
    });

    return { success: "Dieline Saved Successfully." };
  } catch (error) {
    console.error(error);
    return { error: "Something Wen't Wrong. Check the Server logs." };
  }
};

export const updateDieline = async (
  data: DielineMetadataFormType,
  id: number,
) => {
  const {
    specification,
    slug,
    title,
    variable,
    bleed,
    defaultDimensions,
    dimensionTypes,
    materials,
    minDimensions,
  } = data;
  try {
    const existingDieline = await prisma.dieline.findFirst({ where: { id } });
    if (!existingDieline) throw new Error("Dieline Not Found.");

    const existingDielineBySlug = await prisma.dieline.findFirst({
      where: { slug, id: { not: id } },
    });
    if (existingDielineBySlug)
      throw new Error("There is another dieline with this slug.");

    await prisma.dieline.update({
      where: { id },
      data: {
        slug,
        title,
        specification,
        variable,
        settings: {
          update: {
            materials,
            dimensionTypes,
            bleed: +bleed,
            defaultDimension: {
              create: defaultDimensions,
            },
            minDimension: {
              create: minDimensions,
            },
          },
        },
      },
    });

    return { success: "Dieline Updated Successfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};
