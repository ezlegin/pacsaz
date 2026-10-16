"use server";

import {
  initiateZarinpalPayment,
  verifyZarrinPalPurchase,
  ZarinPalStatus,
} from "@/lib/zarrinpal";
import { notifyPaymentResult } from "@/lib/notifications/send";
import { calculatePlanEndDate } from "@/utils/calculatePlanEndDate";
import { mapPeriodLabel } from "@/utils/mapPeriodLabel";
import { mapPlanLevel } from "@/utils/mapPlanLevel";
import { mapPlanTitle } from "@/utils/mapPlanTitle";
import { getSessionUser } from "@repo/auth/session";
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

    // A campaign coupon has the same shape as any other percent coupon, so
    // checkout needs no special case; look it up by code as usual.
    let couponId: number | undefined = undefined;
    if (discountCode) {
      const existingCoupon = await prisma.coupon.findUnique({
        where: { code: discountCode },
      });
      if (!existingCoupon) return { error: "Coupon Invalid." };
      couponId = existingCoupon.id;
    }

    const user = await getSessionUser();
    if (!user) return { error: "User Not Found." };

    const tsRes = await prisma.$transaction(async (ts) => {
      const newPayment = await ts.payment.create({
        data: {
          amount,
          discountCode,
          discountCodeAmount,
          totalDiscount: discountCodeAmount,
          method: "zarinPal",
          status: "pending",
          total,
          period,
          userId: user.id,
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

      await ts.payment.update({
        where: { id: newPayment.id },
        data: { authority: res.data?.authority },
      });

      if (res.success) {
        return { success: "به درگاه پرداخت منتقل می شوید...", data: res.data };
      } else {
        await ts.payment.update({
          where: { id: newPayment.id },
          data: { status: "could_not_initiate" },
        });
        return { error: res.error };
      }
    });

    return tsRes;
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
    const user = await getSessionUser();
    if (!user) throw new Error("User Not Found.");

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("پرداخت نا موفق! (زمان به پایان رسید.)"));
      }, 30000);
    });

    // Read before verification so the failure path still knows what the user
    // was trying to buy and for how much.
    const pendingPayment = (await Promise.race([
      timeoutPromise,
      prisma.payment.findUnique({
        where: { authority },
        include: { tarrif: true },
      }),
    ])) as (Payment & { tarrif: Tarrif }) | null;

    if (!pendingPayment) throw new Error("توکن پرداخت معتبر نمی باشد.");

    const planTitle = mapPlanTitle(pendingPayment.tarrif.key);

    const res = await prisma.$transaction(async (ts) => {
      const payment = (await Promise.race([
        timeoutPromise,
        ts.payment.findUnique({
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
          await ts.payment.update({
            where: { id: payment.id },
            data: { status: "failed" },
          });
        throw new Error(verifyPayment.error);
      }

      await ts.payment.update({
        where: { id: payment.id },
        data: { status: "success" },
      });

      // Scoped to this user: activating one subscription must only retire that
      // user's own previous plan. Without the `userId` filter a single purchase
      // deactivated every active plan in the database.
      const previousActivePlans = await ts.plan.findMany({
        where: { userId: user.id, status: "active" },
      });

      await ts.plan.updateMany({
        where: { id: { in: previousActivePlans.map((p) => p.id) } },
        data: {
          status: "inActive",
        },
      });

      const tarrif = payment.tarrif;

      const newPlan = await ts.plan.create({
        data: {
          key: tarrif.key,
          title: planTitle,
          level: mapPlanLevel(tarrif.key),
          type: previousActivePlans.length > 0 ? "renewal" : "new",
          period: payment.period,
          fairDownload: tarrif.fairDownload[payment.period],
          endsAt: calculatePlanEndDate(payment.period),
          userId: user.id,
          isPremium: tarrif.level > 1,
          paymentId: payment.id,
        },
      });

      return {
        success: verifyPayment.success,
        plan: {
          paymentId: payment.id,
          amount: payment.amount,
          periodLabel: mapPeriodLabel(payment.period),
          endsAt: newPlan.endsAt,
          fairDownload: newPlan.fairDownload,
        },
      };
    });

    // Outside the transaction on purpose: a slow or failing mail provider must
    // never roll back a payment that the gateway already confirmed. The
    // notification is deduped per payment id, so a replayed callback from
    // ZarinPal cannot mail the user twice.
    await notifyPaymentResult({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      paymentId: res.plan.paymentId,
      succeeded: true,
      planTitle,
      amount: res.plan.amount,
      periodLabel: res.plan.periodLabel,
      endsAt: res.plan.endsAt,
      fairDownload: res.plan.fairDownload,
    });

    return { result: "success", message: res.success! };
  } catch (error) {
    console.error(error);

    // The receipt for a failed attempt is best-effort: swallowing a mail error
    // here keeps the original payment failure as the message the user sees.
    await notifyPaymentFailure(authority);

    return { result: "failed", message: (error as Error).message };
  }
};

/**
 * Mails the "payment did not complete" receipt.
 *
 * Separate from the success path because it runs after the transaction has
 * already been rolled back, so the payment is re-read outside it. At most one
 * message per payment: the notification log is keyed on the payment id, which
 * means a user who retries and fails again is not spammed once per attempt.
 */
const notifyPaymentFailure = async (authority: string) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { authority },
      include: { tarrif: true, user: true },
    });

    if (!payment || payment.status === "success") return;

    await notifyPaymentResult({
      userId: payment.userId,
      email: payment.user.email,
      fullName: payment.user.fullName,
      paymentId: payment.id,
      succeeded: false,
      planTitle: mapPlanTitle(payment.tarrif.key),
      amount: payment.amount,
    });
  } catch (error) {
    console.error("Failed to send the payment-failure email:", error);
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
