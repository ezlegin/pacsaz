"use server";

import { ActionResult, actionError } from "@/lib/actionError";
import { requireAdmin } from "@/lib/session";
import {
  TarrifFormType,
  tarrifFormSchema,
} from "@/lib/validationSchema/validatoinSchema";
import { PlanKey, prisma } from "@repo/db";

const levels: Record<PlanKey, number> = { standard: 1, pro: 2, organization: 3 };

/** Form strings to non-negative numbers, or null when one is not a number. */
const toPeriods = (values: TarrifFormType["price"]) => {
  const out = {
    monthly: Number(values.monthly),
    threeMonth: Number(values.threeMonth),
    annual: Number(values.annual),
  };
  return Object.values(out).every((n) => Number.isFinite(n) && n >= 0) ? out : null;
};

/** Checks the form on the server and turns it into the stored shape. */
const toTarrifData = (data: TarrifFormType) => {
  const parsed = tarrifFormSchema.safeParse(data);
  if (!parsed.success) return null;
  const { fairDownload, price, discountAmount, selectedFeatures, ...rest } = parsed.data;

  const downloads = toPeriods(fairDownload);
  const prices = toPeriods(price);
  const discount = Number(discountAmount);
  if (!downloads || !prices || !Number.isFinite(discount) || discount < 0) return null;

  return {
    ...rest,
    level: levels[rest.key],
    discountAmount: discount,
    downloads,
    prices,
    features: selectedFeatures.map((f) => ({ tarrifFeatureId: Number(f) })),
  };
};

const invalid = { error: "Please check the fields: prices and limits must be numbers of 0 or more." } as const;

export const createTarrif = async (data: TarrifFormType): Promise<ActionResult> => {
  try {
    await requireAdmin();

    const tarrif = toTarrifData(data);
    if (!tarrif) return invalid;
    const { downloads, prices, features, ...fields } = tarrif;

    if (await prisma.tarrif.findUnique({ where: { key: fields.key } }))
      return { error: `There is already a tariff with the key "${fields.key}".` };

    if (fields.isRecommended && (await prisma.tarrif.findFirst({ where: { isRecommended: true } })))
      return { error: "Another tariff is already marked as recommended." };

    await prisma.tarrif.create({
      data: {
        ...fields,
        fairDownload: { create: downloads },
        price: { create: prices },
        features: { createMany: { data: features } },
      },
    });

    return { success: "Tariff created." };
  } catch (error) {
    return { error: actionError(error) };
  }
};

export const updateTarrif = async (
  data: TarrifFormType,
  id: number,
): Promise<ActionResult> => {
  try {
    await requireAdmin();

    const tarrif = toTarrifData(data);
    if (!tarrif) return invalid;
    const { downloads, prices, features, ...fields } = tarrif;

    if (!(await prisma.tarrif.findUnique({ where: { id } })))
      return { error: "Tariff not found." };

    if (await prisma.tarrif.findFirst({ where: { key: fields.key, id: { not: id } } }))
      return { error: `There is already a tariff with the key "${fields.key}".` };

    if (
      fields.isRecommended &&
      (await prisma.tarrif.findFirst({ where: { isRecommended: true, id: { not: id } } }))
    )
      return { error: "Another tariff is already marked as recommended." };

    await prisma.tarrif.update({
      where: { id },
      data: {
        ...fields,
        // Upserts: a tariff made before these rows existed (or by a partial
        // seed) has no price or download limit yet, and a nested `update` on a
        // missing relation fails with P2025.
        fairDownload: { upsert: { create: downloads, update: downloads } },
        price: { upsert: { create: prices, update: prices } },
        features: {
          deleteMany: { tarrifId: id },
          createMany: { data: features },
        },
      },
    });

    return { success: "Tariff updated." };
  } catch (error) {
    return { error: actionError(error) };
  }
};

export const deleteTarrif = async (id: number): Promise<ActionResult> => {
  try {
    await requireAdmin();

    const payments = await prisma.payment.count({ where: { tarrifId: id } });
    if (payments > 0)
      return { error: "This tariff has payments on record, so it can't be deleted." };

    await prisma.tarrif.delete({ where: { id } });

    return { success: "Tariff deleted." };
  } catch (error) {
    return { error: actionError(error) };
  }
};
