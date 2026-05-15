"use server";

import { initiateZarinpalPayment } from "@/lib/zarrinpal";
import { Payment, PlanKey, PlanPeriod, prisma } from "@repo/db";

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

export const initiatePayment = async (
  amount: number,
  plan: PlanKey,
  period: PlanPeriod,
) => {
  try {
    const tarrif = await prisma.tarrif.findUnique({ where: { key: plan } });
    if (!tarrif) return { error: "Tarrif Not Found." };

    const newPayment = await prisma.payment.create({
      data: {
        amount,
        discountCode: "",
        discountCodeAmount: 0,
        totalDiscount: 0,
        method: "zarrinPal",
        status: "pending",
        total: amount,
        period,
        userId: 1, // todo,
        tarrifId: tarrif.id,
      },
      include: { user: true },
    });

    const res = await initiateZarinpalPayment({
      amount,
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

export const verifyPayment = async (authority: string): Response => {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("پرداخت نا موفق! (زمان به پایان رسید.)"));
      }, 30000);
    });

    const result = (await Promise.race([
      timeoutPromise,
      prisma.payment.findUnique({
        where: { authority },
        select: { amount: true, authority: true },
      }),
    ])) as Payment;
    if (!result) throw new Error("توکن پرداخت معتبر نمی باشد.");

    // todo: apply zarringpal verification.
    const res = true;

    if (!res) throw new Error("پرداخت نا موفق!");

    return { result: "success", message: "تراکنش با موفقیت انجام شد." };
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
