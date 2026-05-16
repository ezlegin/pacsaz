"use server";

import ZarinPal from "zarinpal-node-sdk";
import { mainUrl } from "./consts";
import { User } from "@repo/db";

const merchantId = process.env.ZARINPAL_MERCHANT_ID;

const zarinpal = new ZarinPal({
  merchantId,
  sandbox: process.env.NODE_ENV === "development" ? true : false,
});

export type ZarinPalStatus = "OK" | "NOK";
interface InitiatePayment {
  data: {
    authority: string;
    fee: number;
    fee_type: string;
    code: number;
    message: string;
  };
}

const callback_url = mainUrl + "/payment/result";

export const initiateZarinpalPayment = async (params: {
  paymentId: number;
  user: User;
  amount: number;
}) => {
  const { amount, user, paymentId } = params;

  try {
    const response = (await zarinpal.payments.create({
      amount: amount * 10, // to IRR
      callback_url,
      description: `User Id ${user.id} | Payment Id: ${paymentId}`,
      mobile: user.phoneNumber,
      email: user.email,
    })) as InitiatePayment;

    const paymentUrl = zarinpal.payments.getRedirectUrl(
      response.data.authority,
    );

    return {
      success: "به درگاه پرداخت منتقل می شوید...",
      data: { paymentUrl, authority: response.data.authority },
    };
  } catch (error) {
    console.error(error);
    return {
      error: "درگاه پرداخت پاسخگو نیست. لطفا دقایقی بعد دوباره تلاش کنید.",
    };
  }
};

interface VerifyPayment {
  data: {
    code: 100 | 101;
    ref_id: number;
  };
  errors: any[];
}

export const verifyZarrinPalPurchase = async (
  authority: string,
  amount: number,
  status: ZarinPalStatus,
) => {
  try {
    if (status === "NOK") throw new Error("پرداخت نا موفق!");
    if (!authority || !amount) throw new Error("Amount and Authory is needed");

    const res = (await zarinpal.verifications.verify({
      amount: amount * 10,
      authority,
    })) as VerifyPayment;

    if (res.data.code === 100) {
      return { success: "تراکتش با موفقیت انجام شد." };
    } else if (res.data.code === 101) {
      return {
        success: "تراکنش از قبل تایید شده است.",
      };
    } else {
      return { error: `خطای درگاه پرداخت. کد: ${res.data.code}` };
    }
  } catch (error) {
    console.error(error);
    return { error: "خطای ناشناخته رخ داد. لطفا لحظاتی بعد دوباره تلاش کنید." };
  }
};
