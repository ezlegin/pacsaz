"use server";

import {
  DielineMetadataFormType,
  DielineUpdateFormType,
} from "@/lib/validationSchema/validatoinSchema";
import { prisma } from "@repo/db";
import { UploadApiResponse } from "cloudinary";
import { deleteImage, uploadCloudFile } from "./cloudinary";
import { materials as allMats } from "@repo/dieline-core/data/materials";

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
    dielineImage,
    modelImage,
    defaultMaterial,
    maxDimensions,
  } = data;

  try {
    // todo: use TSX
    const existingDieline = await prisma.dieline.findFirst({ where: { slug } });
    if (existingDieline) {
      return { error: "Slug Should Be Unique." };
    }

    const newDieline = await prisma.dieline.create({
      data: {
        slug,
        title,
        minHeight: minDimensions.height,
        minLength: minDimensions.length,
        minWidth: minDimensions.width,
        maxHeight: maxDimensions.height,
        maxLength: maxDimensions.length,
        maxWidth: maxDimensions.width,
        dimensionTypes,
        materials,
        defaultMaterial,
        specification: JSON.stringify({
          shapes: [],
          rulers: [],
          models: [],
        }),
        variable: JSON.stringify([]),
        effect: JSON.stringify([]),
        categoryByModel: {
          connect: categoryByModel.map((i) => ({ slug: i })),
        },
        categoryByUsage: {
          connect: categoryByUsage.map((i) => ({ slug: i })),
        },
        settings: {
          create: {
            material: materials.split(",")[0]!, // todo: get from form
            dimensionType: "manufacture", // todo: get from form
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

    const images = { dielineImage, modelImage };

    for (const image in images) {
      const img = images[image as keyof typeof images];

      if (img && img instanceof File) {
        const buffer = Buffer.from(await img.arrayBuffer());

        const { secure_url, public_id } = (await uploadCloudFile(buffer, {
          folder: "dieline",
          width: 800,
          resource_type: "image",
        })) as UploadApiResponse;

        const data = {
          publicId: public_id,
          url: secure_url,
          dieline: {
            connect: { id: newDieline.id },
          },
        };

        if (image === "dielineImage")
          await prisma.dielineImage.create({
            data,
          });

        if (image === "modelImage")
          await prisma.modelImage.create({
            data,
          });
      }
    }

    return { success: "Dieline Created Successfully.", slug };
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
    dielineImage,
    modelImage,
    defaultMaterial,
    maxDimensions,
  } = data;

  try {
    const existingDieline = await prisma.dieline.findFirst({
      where: { slug, id: { not: id } },
    });
    if (existingDieline) {
      return { error: "Slug Should Be Unique." };
    }

    const updatedDieline = await prisma.dieline.update({
      where: { id },
      data: {
        minHeight: minDimensions.height,
        minLength: minDimensions.length,
        minWidth: minDimensions.width,
        maxHeight: maxDimensions.height,
        maxLength: maxDimensions.length,
        maxWidth: maxDimensions.width,
        materials,
        dimensionTypes,
        defaultMaterial,
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
      include: { dielineImage: true, modelImage: true },
    });

    const images = { dielineImage, modelImage };

    for (const image in images) {
      const img = images[image as keyof typeof images];

      if (img && img instanceof File) {
        const buffer = Buffer.from(await img.arrayBuffer());

        const publicId = updatedDieline[image as keyof typeof images]?.publicId;

        if (publicId) await deleteImage(publicId);

        const { secure_url, public_id } = (await uploadCloudFile(buffer, {
          folder: "dieline",
          width: 800,
          resource_type: "image",
        })) as UploadApiResponse;

        const data = {
          publicId: public_id,
          url: secure_url,
        };

        if (image === "dielineImage")
          await prisma.dielineImage.update({
            where: { publicId: updatedDieline.dielineImage?.publicId },
            data,
          });

        if (image === "modelImage")
          await prisma.modelImage.update({
            where: { publicId: updatedDieline.modelImage?.publicId },
            data,
          });
      }
    }

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
  const { specification, variable, effect } = data;
  try {
    const existingDieline = await prisma.dieline.findFirst({ where: { id } });
    if (!existingDieline) throw new Error("Dieline Not Found.");

    await prisma.dieline.update({
      where: { id },
      data: {
        specification,
        variable,
        effect,
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

export const deleteDielineImage = async (publicId: string) => {
  try {
    const { error } = await deleteImage(publicId);
    if (error) throw new Error(error);

    await prisma.dielineImage.delete({ where: { publicId } });

    return { success: "Dieline Image Deleted Successfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};

export const deleteModelImage = async (publicId: string) => {
  try {
    const { error } = await deleteImage(publicId);
    if (error) throw new Error(error);

    await prisma.modelImage.delete({ where: { publicId } });

    return { success: "Model Image Deleted Successfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};
