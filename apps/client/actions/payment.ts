"use server";

import {
  initiateZarinpalPayment,
  verifyZarrinPalPurchase,
  ZarinPalStatus,
} from "@/lib/zarrinpal";
import { calculatePlanEndDate } from "@/utils/calculatePlanEndDate";
import { mapPlanLevel } from "@/utils/mapPlanLevel";
import { mapPlanTitle } from "@/utils/mapPlanTitle";
import {
  FairDownload,
  Payment,
  PlanKey,
  PlanPeriod,
  prisma,
  Tarrif,
} from "@repo/db";

type Response = Promise<
  | {
      result: "success";
      message: string;
    }
  | {
      result: "failed";
      message: string;
    }
>;

export const createPayment = async (params: {
  amount: number;
  total: number;
  plan: PlanKey;
  period: PlanPeriod;
  discountCode: string | null;
  discountCodeAmount: number;
}) => {
  const { amount, discountCode, discountCodeAmount, period, plan, total } =
    params;
  try {
    const tarrif = await prisma.tarrif.findUnique({ where: { key: plan } });
    if (!tarrif) return { error: "Tarrif Not Found." };

    let couponId: number | undefined = undefined;
    if (discountCode) {
      const existingCoupon = await prisma.coupon.findUnique({
        where: { code: discountCode },
      });
      if (!existingCoupon) return { error: "Coupon Invalid." };
      couponId = existingCoupon.id;
    }

    const newPayment = await prisma.payment.create({
      data: {
        amount,
        discountCode,
        discountCodeAmount,
        totalDiscount: discountCodeAmount,
        method: "zarinPal",
        status: "pending",
        total,
        period,
        userId: 1, // todo,
        tarrifId: tarrif.id,
        couponId,
      },
      include: { user: true },
    });

    const res = await initiateZarinpalPayment({
      amount: total,
      paymentId: newPayment.id,
      user: newPayment.user,
    });

    await prisma.payment.update({
      where: { id: newPayment.id },
      data: { authority: res.data?.authority },
    });

    if (res.success) {
      return { success: "به درگاه پرداخت منتقل می شوید...", data: res.data };
    } else {
      await prisma.payment.update({
        where: { id: newPayment.id },
        data: { status: "could_not_initiate" },
      });
      return { error: res.error };
    }
  } catch (error) {
    console.error(error);
    return { error: "مشکلی رخ داد. لطفا لحظاتی بعد دوباره تلاش کنید." };
  }
};

export const verifyPayment = async (
  authority: string,
  status: ZarinPalStatus,
): Response => {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("پرداخت نا موفق! (زمان به پایان رسید.)"));
      }, 30000);
    });

    const payment = (await Promise.race([
      timeoutPromise,
      prisma.payment.findUnique({
        where: { authority },
        include: { tarrif: { include: { fairDownload: true } } },
      }),
    ])) as Payment & { tarrif: Tarrif & { fairDownload: FairDownload } };
    if (!payment) throw new Error("توکن پرداخت معتبر نمی باشد.");

    const verifyPayment = await verifyZarrinPalPurchase(
      payment.authority!,
      payment.amount,
      status,
    );

    if (verifyPayment.error) {
      if (payment.status !== "failed")
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "failed" },
        });
      throw new Error(verifyPayment.error);
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "success" },
    });

    const tarrif = payment.tarrif;
    const currentPlan = await prisma.plan.findFirst({
      where: { status: "active", endsAt: { gte: new Date() } },
    });

    await prisma.plan.create({
      data: {
        key: tarrif.key,
        title: mapPlanTitle(tarrif.key),
        level: mapPlanLevel(tarrif.key),
        type: currentPlan ? "renewal" : "new",
        period: payment.period,
        fairDownload: tarrif.fairDownload[payment.period],
        endsAt: calculatePlanEndDate(payment.period),
        userId: 1,
        payment: {
          connect: {
            id: payment.id,
          },
        },
      },
    });

    return { result: "success", message: verifyPayment.success! };
  } catch (error) {
    console.error(error);
    return { result: "failed", message: (error as Error).message };
  }
};

export const createPaymentTrack = async (params: {
  userId: number;
  plan: PlanKey;
  period: PlanPeriod;
}) => {
  try {
    await prisma.paymentTrack.create({ data: params });
  } catch (error) {
    console.error(error);
  }
};
