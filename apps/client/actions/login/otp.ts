"use server";

import { serverErrorMessage } from "@/data/consts";
import { InputFormType } from "@/lib/validatoinSchema";
import { prisma } from "@repo/db";
import { addMinutes } from "date-fns";
import { sendOtpSms } from "@repo/lib/sms";

function generateOtpCode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export const sendOtpCode = async (data: InputFormType) => {
  const { phoneNumber } = data;
  const code = generateOtpCode();
  try {
    const existingOtps = await prisma.otp.findMany({ where: { phoneNumber } });
    const lastOtp = existingOtps.at(-1);
    if (lastOtp && lastOtp.expiresAt > new Date())
      return { success: "کد تایید قبلا برای شما ارسال شده است." };

    await prisma.otp.deleteMany({
      where: { phoneNumber },
    });

    await prisma.otp.create({
      data: {
        code,
        phoneNumber,
        expiresAt: addMinutes(new Date(), 2),
      },
    });

    const res = await sendOtpSms(phoneNumber, code);
    if (res.error) throw new Error(res.error);

    return { success: "کد تایید جدید ارسال شد." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};

export const verifyOtp = async (phoneNumber: string, code: string) => {
  try {
    const existingOtp = await prisma.otp.findFirst({
      where: {
        phoneNumber,
        code,
        expiresAt: { gt: new Date() },
      },
    });

    if (!existingOtp) return { error: "کد معتبر نمی باشد." };

    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!existingUser)
      await prisma.user.create({
        data: {
          email: "",
          firstName: "کاربر",
          fullName: "کاربر",
          phoneNumber,
        },
      });

    return { success: "کد معتبر! خوش آمدید.", isNewUser: !!!existingUser };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};
