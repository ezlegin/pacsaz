"use server";

import { serverErrorMessage } from "@/data/consts";
import { inputFormSchema, InputFormType } from "@/lib/validatoinSchema";
import { prisma } from "@repo/db";
import { addMinutes } from "date-fns";
import { sendOtpSms } from "@repo/lib/sms";
import { randomInt } from "node:crypto";
import { clientIp, rateLimit, waitFa } from "@repo/db/data/rateLimit";
import { headers } from "next/headers";

/** A five-digit code from the system's secure random source, not `Math.random`. */
function generateOtpCode() {
  return randomInt(10000, 100000).toString();
}

export const sendOtpCode = async (data: InputFormType) => {
  // Validated here too: an action is a public endpoint, not only the form.
  const parsed = inputFormSchema.safeParse(data);
  if (!parsed.success) return { error: "شماره موبایل معتبر نیست." };
  const { phoneNumber } = parsed.data;
  const code = generateOtpCode();
  try {
    // Every SMS costs money: at most 5 requests an hour from one IP, and 5 an
    // hour to one number, so neither a script nor a grudge can run up the bill.
    const ip = clientIp(await headers());
    for (const limit of [
      await rateLimit(`sms:ip:${ip}`, 5, 3600),
      await rateLimit(`sms:phone:${phoneNumber}`, 5, 3600),
    ]) {
      if (!limit.ok)
        return { error: `درخواست‌های زیادی ثبت شده است. ${waitFa(limit.retryAfterSeconds)} دیگر دوباره تلاش کنید.` };
    }

    // One live code per number: a second request inside its two minutes sends
    // nothing, which also keeps anyone from flooding a number with SMS.
    const live = await prisma.otp.findFirst({
      where: { phoneNumber, expiresAt: { gt: new Date() } },
    });
    if (live) return { success: "کد تایید قبلا برای شما ارسال شده است." };

    await prisma.otp.deleteMany({ where: { phoneNumber } });
    await prisma.otp.create({
      data: { code, phoneNumber, expiresAt: addMinutes(new Date(), 2) },
    });

    const res = await sendOtpSms(phoneNumber, code);
    if (res.error) throw new Error(res.error);

    return { success: "کد تایید جدید ارسال شد." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};
