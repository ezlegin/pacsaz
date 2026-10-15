"use server";

import { serverErrorMessage } from "@/data/consts";
import { isMailConfigured, sendContactReply } from "@/lib/mail";
import { prisma } from "@repo/db";
import { revalidatePath } from "next/cache";

export type ContactActionResult =
  | { success: string; error?: undefined }
  | { error: string; success?: undefined };

/**
 * Reply outcome. The extra fields are mutually exclusive with `error` so the
 * union discriminates properly — a shared optional `error` on both branches
 * makes `res.error` inaccessible after narrowing.
 */
export type ReplyResult =
  | { success: string; emailSent: boolean; warning?: string; error?: undefined }
  | { error: string; success?: undefined; emailSent?: undefined };

/** Matches what `<DeleteButton deleteFn={...} />` expects. */
export type DeleteContactResult = Promise<
  { success: string; error?: undefined } | { error: string; success?: undefined }
>;

/**
 * Marks a message as read.
 *
 * Deliberately does NOT call `revalidatePath`: this is invoked while rendering
 * the detail page, and revalidating from within a render is a loop hazard. It
 * returns a plain result so any caller can still surface an error.
 */
export const markContactRead = async (
  id: number,
): Promise<ContactActionResult> => {
  try {
    await prisma.contact.update({
      where: { id },
      data: { status: "read" },
    });
    return { success: "خوانده شد." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};

/**
 * Sends a reply and records it on the message.
 *
 * The reply text is ALWAYS persisted, even when delivery fails or the provider
 * is not configured yet, so an operator never loses what they wrote. `replySent`
 * records whether the mail actually left.
 */
export const replyToContact = async (
  id: number,
  body: string,
): Promise<ReplyResult> => {
  const reply = body.trim();
  if (reply.length < 3) return { error: "متن پاسخ خیلی کوتاه است." };

  try {
    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) return { error: "پیام پیدا نشد." };

    const result = await sendContactReply({
      to: contact.email,
      subject: `پاسخ پک‌ساز: ${contact.subject}`,
      body: reply,
      originalMessage: contact.message,
      recipientName: contact.fullName,
    });

    await prisma.contact.update({
      where: { id },
      data: {
        replyMessage: reply,
        repliedAt: new Date(),
        replySent: result.sent,
        replyId: result.sent ? (result.id ?? null) : null,
        // a saved-but-unsent reply still counts as handled
        status: "replied",
      },
    });

    revalidatePath("/contacts");
    revalidatePath(`/contacts/${id}`);

    if (!result.sent) {
      return {
        success: "پاسخ ذخیره شد.",
        emailSent: false,
        warning: result.reason,
      };
    }

    return { success: "پاسخ با موفقیت ارسال شد.", emailSent: true };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};

export const deleteContact = async (id: number): DeleteContactResult => {
  try {
    await prisma.contact.delete({ where: { id } });
    revalidatePath("/contacts");
    return { success: "پیام حذف شد." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};

export const getMailStatus = async () => ({ configured: isMailConfigured() });
