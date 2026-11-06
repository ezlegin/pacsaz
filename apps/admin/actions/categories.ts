"use server";

import { ActionResult, actionError } from "@/lib/actionError";
import { requireAdmin } from "@/lib/session";
import {
  CategoriesFormType,
  categoriesFormSchema,
} from "@/lib/validationSchema/validatoinSchema";
import { prisma } from "@repo/db";

type CategoryKind = "model" | "usage";

/**
 * The two category tables have the same shape, so one delegate stands in for
 * either. The cast is what keeps TypeScript from asking for a union call
 * signature it can't build.
 */
const table = (type: CategoryKind) =>
  (type === "model"
    ? prisma.dielineCategoryByModel
    : prisma.dielineCategoryByUsage) as typeof prisma.dielineCategoryByModel;

const validKind = (type: unknown): type is CategoryKind =>
  type === "model" || type === "usage";

export const createCategory = async (
  data: CategoriesFormType,
  type: CategoryKind,
): Promise<ActionResult> => {
  try {
    await requireAdmin();

    const parsed = categoriesFormSchema.safeParse(data);
    if (!parsed.success || !validKind(type))
      return { error: "Please check the form fields." };

    const existing = await table(type).findFirst({ where: { slug: parsed.data.slug } });
    if (existing) return { error: "The slug must be unique." };

    await table(type).create({ data: parsed.data });

    return { success: "Category created." };
  } catch (error) {
    return { error: actionError(error) };
  }
};

export const updateCategory = async (
  data: CategoriesFormType,
  type: CategoryKind,
  id: number,
): Promise<ActionResult> => {
  try {
    await requireAdmin();

    const parsed = categoriesFormSchema.safeParse(data);
    if (!parsed.success || !validKind(type))
      return { error: "Please check the form fields." };

    const existing = await table(type).findUnique({ where: { id } });
    if (!existing) return { error: "Category not found." };

    const bySlug = await table(type).findFirst({
      where: { slug: parsed.data.slug, id: { not: id } },
    });
    if (bySlug) return { error: "There is another category with this slug." };

    await table(type).update({ where: { id }, data: parsed.data });

    return { success: "Category updated." };
  } catch (error) {
    return { error: actionError(error) };
  }
};

export const deleteCategory = async (
  id: number,
  type: CategoryKind,
): Promise<ActionResult> => {
  try {
    await requireAdmin();
    if (!validKind(type)) return { error: "Unknown category type." };

    await table(type).delete({ where: { id } });

    return { success: "Category deleted." };
  } catch (error) {
    return { error: actionError(error) };
  }
};
