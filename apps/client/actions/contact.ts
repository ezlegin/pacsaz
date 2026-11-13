"use server";

import { contactFormSchema, ContactFormType } from "@/lib/validatoinSchema";
import { serverErrorMessage } from "@/data/consts";
import { prisma } from "@repo/db";
import { clientIp, rateLimit, waitFa } from "@repo/db/data/rateLimit";
import { headers } from "next/headers";

export type ContactSubmitResult =
  | { success: string; error?: undefined }
  | { error: string; success?: undefined };

export const submitContactMessage = async (
  data: ContactFormType,
): Promise<ContactSubmitResult> => {
  try {
    const parsed = contactFormSchema.safeParse(data);
    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "اطلاعات ارسالی معتبر نیست.",
      };
    }

    const { fullName, email, phone, subject, message } = parsed.data;

    // 5 messages an hour per IP keeps the inbox usable if a bot finds the form.
    const limit = await rateLimit(`contact:ip:${clientIp(await headers())}`, 5, 3600);
    if (!limit.ok) return { error: `پیام‌های زیادی فرستاده‌اید. ${waitFa(limit.retryAfterSeconds)} دیگر دوباره تلاش کنید.` };

    await prisma.contact.create({
      data: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phone?.trim() ? phone.trim() : null,
        subject: subject.trim(),
        message: message.trim(),
      },
    });

    return { success: "پیام شما دریافت شد. در اولین فرصت پاسخ می‌دهیم." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};
