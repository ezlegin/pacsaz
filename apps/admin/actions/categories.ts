"use server";

import { ServerErrorMessage } from "@/data/consts";
import { CategoriesFormType } from "@/lib/validationSchema/validatoinSchema";
import { prisma } from "@repo/db";

export const createCategory = async (
  data: CategoriesFormType,
  type: "model" | "usage",
) => {
  try {
    const existingCategory =
      type === "model"
        ? await prisma.dielineCategoryByModel.findFirst({
            where: { slug: data.slug },
          })
        : await prisma.dielineCategoryByUsage.findFirst({
            where: { slug: data.slug },
          });
    if (existingCategory) return { error: "Slug Should Be Unique." };

    if (type === "model") {
      await prisma.dielineCategoryByModel.create({ data });
    } else {
      await prisma.dielineCategoryByUsage.create({ data });
    }

    return { success: "Category Created Successfully." };
  } catch (error) {
    console.error(error);
    return { error: ServerErrorMessage };
  }
};

export const updateCategory = async (
  data: CategoriesFormType,
  type: "model" | "usage",
  id: number,
) => {
  try {
    const existingCategory =
      type === "model"
        ? await prisma.dielineCategoryByModel.findFirst({
            where: { id },
          })
        : await prisma.dielineCategoryByUsage.findFirst({
            where: { id },
          });
    if (!existingCategory) return { error: "Category Not Found." };

    const existingCategoryBySlug =
      type === "model"
        ? await prisma.dielineCategoryByModel.findFirst({
            where: { slug: data.slug, id: { not: id } },
          })
        : await prisma.dielineCategoryByUsage.findFirst({
            where: { slug: data.slug, id: { not: id } },
          });
    if (existingCategoryBySlug)
      return { error: "There is another category with this slug." };

    if (type === "model") {
      await prisma.dielineCategoryByModel.update({ where: { id }, data });
    } else {
      await prisma.dielineCategoryByUsage.update({ where: { id }, data });
    }

    return { success: "Category Updated Successfully." };
  } catch (error) {
    console.error(error);
    return { error: ServerErrorMessage };
  }
};

export const deleteCategory = async (id: number, type: "model" | "usage") => {
  try {
    const existingCategory =
      type === "model"
        ? await prisma.dielineCategoryByModel.findFirst({
            where: { id },
          })
        : await prisma.dielineCategoryByUsage.findFirst({
            where: { id },
          });
    if (!existingCategory) return { error: "Category Not Found." };

    if (type === "model") {
      await prisma.dielineCategoryByModel.delete({ where: { id } });
    } else {
      await prisma.dielineCategoryByUsage.delete({ where: { id } });
    }

    return { success: "Category Updated Successfully." };
  } catch (error) {
    console.error(error);
    return { error: ServerErrorMessage };
  }
};
