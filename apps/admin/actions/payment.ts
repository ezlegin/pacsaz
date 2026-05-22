"use server";

import { PaymentFormType } from "@/lib/validationSchema/validatoinSchema";
import { PlanKey, PlanPeriod, prisma } from "@repo/db";
import { addMonths } from "date-fns";

export const createPayment = async (data: PaymentFormType) => {
  const {
    amount,
    from,
    discountCodeAmount,
    period,
    planKey,
    status,
    total,
    userId,
    discountCode,
  } = data;

  const title = mapPlanTitle(planKey);
  const endsAt = mapPlanDateRange(from, period);
  const level = mapPlanLevel(planKey);

  try {
    const tarrif = await prisma.tarrif.findUnique({
      where: { key: planKey },
      include: { fairDownload: true },
    });
    if (!tarrif || !tarrif.fairDownload)
      return { error: "Tarrif or Tarrif Fair Download not available." };

    await prisma.payment.create({
      data: {
        amount,
        discountCode,
        discountCodeAmount,
        status,
        total,
        totalDiscount: discountCodeAmount,
        method: "admin",
        period,
        tarrif: {
          connect: {
            id: tarrif.id,
          },
        },
        user: {
          connect: { id: +userId }, //todo
        },
        coupon:
          discountCode.length > 0
            ? {
                connect: { code: discountCode },
              }
            : undefined,

        plan: {
          create: {
            title,
            endsAt,
            fairDownload: tarrif.fairDownload[period],
            key: planKey,
            level,
            period,
            isPremium: planKey !== "standard",
            userId: +userId,
            startedAt: from,
            type: "new",
          },
        },
      },
    });

    if (discountCode)
      await prisma.coupon.update({
        where: { code: discountCode },
        data: { used: { increment: 1 } },
      });

    return { success: "Payment and Subscription created successfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).name };
  }
};

export const updatePayment = async (data: PaymentFormType, id: number) => {
  const {
    amount,
    from,
    discountCodeAmount,
    period,
    planKey,
    status,
    total,
    userId,
    discountCode,
  } = data;

  const title = mapPlanTitle(planKey);
  const endsAt = mapPlanDateRange(from, period);
  const level = mapPlanLevel(planKey);

  try {
    const tarrif = await prisma.tarrif.findUnique({
      where: { key: planKey },
      include: { fairDownload: true },
    });
    if (!tarrif || !tarrif.fairDownload)
      return { error: "Tarrif or Tarrif Fair Download not available." };

    await prisma.payment.update({
      where: { id },
      data: {
        amount,
        discountCode,
        discountCodeAmount,
        status,
        total,
        totalDiscount: discountCodeAmount,
        method: "admin",
        user: {
          connect: { id: +userId },
        },
        coupon:
          discountCode.length > 0
            ? {
                connect: { code: discountCode },
                update: { used: { increment: 1 } },
              }
            : undefined,

        plan: {
          update: {
            title,
            endsAt,
            fairDownload: tarrif.fairDownload[period],
            key: planKey,
            level,
            period,
            isPremium: planKey !== "standard",
            userId: +userId,
            startedAt: from,
            type: "new",
          },
        },
      },
    });

    return { success: "Payment and Subscription created successfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).name };
  }
};

export const deletePayment = async (id: number) => {
  try {
    await prisma.$transaction(async (ts) => {
      const deletedPayment = await ts.payment.delete({
        where: { id },
        include: { plan: true },
      });
      await ts.plan.delete({ where: { id: deletedPayment.plan?.id } });
    });

    return { success: "Payment Deleted Successfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).name };
  }
};

// UTILS
const mapPlanTitle = (planKey: PlanKey) => {
  switch (planKey) {
    case "standard":
      return "استاندارد";
    case "pro":
      return "حرفه‌ای";
    case "organization":
      return "سازمانی";
  }
};

const mapPlanDateRange = (from: Date, period: PlanPeriod) => {
  switch (period) {
    case "monthly":
      return addMonths(from, 1);
    case "threeMonth":
      return addMonths(from, 3);
    case "annual":
      return addMonths(from, 12);
  }
};

const mapPlanLevel = (planKey: PlanKey) => {
  switch (planKey) {
    case "standard":
      return 1;
    case "pro":
      return 2;
    case "organization":
      return 3;
  }
};
