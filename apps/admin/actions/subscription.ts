"use server";

import { ActionResult, actionError } from "@/lib/actionError";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@repo/db";
import { addMonths } from "date-fns";

/**
 * Support tools for a customer's subscription. Before these, the only way to
 * fix a plan was to fake a payment for it.
 */

const EXTEND_MONTHS = [1, 3, 12] as const;

/**
 * Adds months to a plan. A plan that already ended is extended from today, so
 * the customer gets the whole period rather than a part already in the past.
 */
export const extendSubscription = async (
  id: number,
  months: number,
): Promise<ActionResult> => {
  try {
    await requireAdmin();
    if (!EXTEND_MONTHS.includes(months as (typeof EXTEND_MONTHS)[number]))
      return { error: "Extend by 1, 3 or 12 months." };

    const plan = await prisma.plan.findUnique({ where: { id } });
    if (!plan) return { error: "Subscription not found." };

    const now = new Date();
    const from = plan.endsAt > now ? plan.endsAt : now;

    await prisma.plan.update({
      where: { id },
      data: { endsAt: addMonths(from, months), status: "active" },
    });

    return { success: `Subscription extended by ${months} month${months > 1 ? "s" : ""}.` };
  } catch (error) {
    return { error: actionError(error) };
  }
};

export const setSubscriptionActive = async (
  id: number,
  active: boolean,
): Promise<ActionResult> => {
  try {
    await requireAdmin();
    if (typeof active !== "boolean") return { error: "Invalid status." };

    await prisma.plan.update({
      where: { id },
      data: { status: active ? "active" : "inActive" },
    });

    return { success: active ? "Subscription activated." : "Subscription deactivated." };
  } catch (error) {
    return { error: actionError(error) };
  }
};

/** Gives the customer their full fair-download quota back for this plan. */
export const resetSubscriptionDownloads = async (id: number): Promise<ActionResult> => {
  try {
    await requireAdmin();

    await prisma.plan.update({ where: { id }, data: { downloaded: 0 } });

    return { success: "Download count reset." };
  } catch (error) {
    return { error: actionError(error) };
  }
};
