"use server";

import { TarrifFormType } from "@/lib/validationSchema/validatoinSchema";
import { PlanKey, prisma } from "@repo/db";

export const createAndUpdateTarrif = async (data: TarrifFormType) => {
  try {
    await prisma.$transaction(async (tx) => {
      const existingTarrif = await tx.tarrif.findMany();
      if (existingTarrif && existingTarrif.length > 0)
        await tx.tarrif.deleteMany();

      const promises = Object.entries(data).map(
        async ([
          key,
          {
            annual,
            monthly,
            threeMonth,
            description,
            fairDownload,
            shortDescription,
            title,
          },
        ]) => {
          await tx.tarrif.create({
            data: {
              title,
              description,
              shortDescription,
              fairDownload: +fairDownload,
              monthly: +monthly,
              threeMonth: +threeMonth,
              annual: +annual,
              key: key as PlanKey,
            },
          });
        },
      );

      await Promise.all(promises);
    });

    return { success: "Tarrif List Updated Successfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).name };
  }
};
