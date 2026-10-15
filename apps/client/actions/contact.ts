"use server";

import { contactFormSchema, ContactFormType } from "@/lib/validatoinSchema";
import { serverErrorMessage } from "@/data/consts";
import { prisma } from "@repo/db";

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
