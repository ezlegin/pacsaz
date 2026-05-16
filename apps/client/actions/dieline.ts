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
  planId: number,
) => {
  const { bleed, width, height, length, dimensionType, material, thickness } =
    settings;

  try {
    const plan = await prisma.plan.findFirst({ where: { id: planId } });
    if (!plan) return { error: "پلن کاربری شما یافت نشد." };
    if (plan.downloaded >= plan.fairDownload)
      return { error: "شما به حداکثر تعداد دانلود رسیده اید." };

    const existingDieline = await prisma.dieline.findFirst({ where: { slug } });
    if (!existingDieline) throw new Error("Dieline Not Found.");

    await prisma.downloadHistory.create({
      data: {
        userId: 1, //todo
        dielineId: existingDieline.id,
        planId,
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

    await prisma.plan.update({
      where: { id: planId },
      data: { downloaded: { increment: 1 } },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
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
    customerId,
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
        customerId: customerId ? +customerId : null,
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
    customerId,
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
        customerId: customerId ? +customerId : null,
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

export const faveDieline = async (dielineId: number) => {
  try {
    const existingDieline = await prisma.dieline.findFirst({
      where: { id: dielineId },
    });
    if (!existingDieline) return { error: "Dieline Not Found." };

    await prisma.favedDieline.create({
      data: { dielineId: existingDieline.id, userId: 1 }, //todo
    });

    return { success: "به لیست علاقه مندی ها اضافه شد." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};

export const unfaveDieline = async (dielineId: number) => {
  try {
    const existingDieline = await prisma.dieline.findFirst({
      where: { id: dielineId },
    });
    if (!existingDieline) return { error: "Dieline Not Found." };

    const favedDieline = await prisma.favedDieline.findFirst({
      where: { AND: [{ userId: 1 }, { dielineId: dielineId }] },
    });

    if (!favedDieline) return { error: "Faved Dieline Not Found." };

    await prisma.favedDieline.delete({
      where: { id: favedDieline.id },
    });

    return { success: "از لیست علاقه مندی ها حذف شد." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};
