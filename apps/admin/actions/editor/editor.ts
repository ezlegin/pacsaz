"use server";

import { prisma } from "@repo/db";

interface Dieline {
  title: string;
  slug: string;
  specification: string;
  variable: string;
}

export const createDieline = async (data: Dieline) => {
  const { specification, slug, title, variable } = data;
  try {
    const existingDieline = await prisma.dieline.findFirst({ where: { slug } });
    if (existingDieline) throw new Error("Slug Should Be Unique.");

    await prisma.dieline.create({
      data: {
        slug,
        title,
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

export const updateDieline = async (data: Dieline, id: number) => {
  const { specification, slug, title, variable } = data;
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
      },
    });

    return { success: "Dieline Updated Successfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};
