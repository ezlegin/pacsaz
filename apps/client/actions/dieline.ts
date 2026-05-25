"use server";

import { serverErrorMessage } from "@/data/consts";
import { SaveDielineFormType } from "@/lib/validatoinSchema";
import { getSessionUser } from "@repo/auth/session";
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
    const plan = await prisma.plan.findFirst({
      where: { id: planId },
      include: { user: true },
    });
    if (!plan) return { error: "پلن کاربری شما یافت نشد." };
    if (plan.downloaded >= plan.fairDownload)
      return { error: "شما به حداکثر تعداد دانلود رسیده اید." };

    const existingDieline = await prisma.dieline.findFirst({ where: { slug } });
    if (!existingDieline) throw new Error("Dieline Not Found.");

    await prisma.$transaction(async (ts) => {
      await ts.downloadHistory.create({
        data: {
          userId: plan.user.id,
          dielineId: existingDieline.id,
          planId,
          settings: {
            create: {
              height,
              length,
              width,
              bleed,
              dimensionType,
              material,
              thickness,
            },
          },
        },
      });

      await ts.plan.update({
        where: { id: planId },
        data: { downloaded: { increment: 1 } },
      });
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
    const user = await getSessionUser();
    if (!user) throw new Error("Use Not Found.");

    const existingDieline = await prisma.dieline.findFirst({ where: { slug } });
    if (!existingDieline) throw new Error("Dieline Not Found.");

    if (customerId) {
      const existingCustoer = await prisma.customer.findFirst({
        where: { id: +customerId },
      });
      if (!existingCustoer)
        return { error: "مشتری یافت نشد. لطفا ابتدا مشتری ایجاد کنید.." };
    }

    await prisma.savedDieline.create({
      data: {
        userId: user.id,
        description: description ?? "",
        dielineId: existingDieline.id,
        title,
        customerId: customerId ? +customerId : null,
        settings: {
          create: {
            height,
            length,
            width,
            bleed,
            dimensionType,
            material,
            thickness,
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
              width,
              height,
              length,
              bleed,
              dimensionType,
              material,
              thickness,
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
    const user = await getSessionUser();
    if (!user) throw new Error("User Not Found.");

    const existingDieline = await prisma.dieline.findFirst({
      where: { id: dielineId },
    });
    if (!existingDieline) return { error: "Dieline Not Found." };

    await prisma.favedDieline.create({
      data: { dielineId: existingDieline.id, userId: user.id },
    });

    return { success: "به لیست علاقه مندی ها اضافه شد." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};

export const unfaveDieline = async (dielineId: number) => {
  try {
    const user = await getSessionUser();
    if (!user) throw new Error("User Not Found.");

    const existingDieline = await prisma.dieline.findFirst({
      where: { id: dielineId },
    });
    if (!existingDieline) return { error: "Dieline Not Found." };

    const favedDieline = await prisma.favedDieline.findFirst({
      where: { AND: [{ userId: user.id }, { dielineId: dielineId }] },
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
