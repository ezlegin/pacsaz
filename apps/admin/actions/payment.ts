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
  const endsAt = mapPlanDataRange(from, period);
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
        totalDiscount: 0,
        method: "admin",
        user: {
          connect: { id: +userId }, //todo
        },

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

    return { success: "Payment and Subscription created successfully." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};

// UTILS
const mapPlanTitle = (planKey: PlanKey) => {
  switch (planKey) {
    case "standard":
      return "استاندارد";
    case "pro":
      return "حرفه‌ای";
    default:
      return "سازمانی";
  }
};

const mapPlanDataRange = (from: Date, period: PlanPeriod) => {
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
