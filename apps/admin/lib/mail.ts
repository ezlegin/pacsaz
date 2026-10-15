import { Resend } from "resend";

/**
 * Reply delivery for contact messages.
 *
 * `RESEND_API_KEY` is intentionally optional: until it is configured, replies
 * are still stored in the database and the admin UI flags them as not sent. That
 * way no reply text is ever lost and adding the key later changes nothing in the
 * calling code.
 */
const apiKey = process.env.RESEND_API_KEY;
const fromEmail =
  process.env.RESEND_FROM_EMAIL ?? "Pacsaz <onboarding@resend.dev>";

const resend = apiKey ? new Resend(apiKey) : null;

export const isMailConfigured = () => Boolean(resend);

export type SendResult =
  | { sent: true; id: string | null }
  | { sent: false; reason: string };

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Sends a reply to a contact message. Never throws — delivery problems are
 * returned so the caller can still persist the reply text.
 */
export const sendContactReply = async ({
  to,
  subject,
  body,
  originalMessage,
  recipientName,
}: {
  to: string;
  subject: string;
  body: string;
  originalMessage?: string;
  recipientName?: string;
}): Promise<SendResult> => {
  if (!resend) {
    return {
      sent: false,
      reason: "RESEND_API_KEY تنظیم نشده است؛ پاسخ ذخیره شد ولی ایمیل ارسال نشد.",
    };
  }

  const safeBody = escapeHtml(body).replace(/\n/g, "<br />");
  const safeOriginal = originalMessage
    ? escapeHtml(originalMessage).replace(/\n/g, "<br />")
    : null;

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html: `
        <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.9;color:#1f2937">
          <p>${recipientName ? `${escapeHtml(recipientName)} عزیز،` : "سلام،"}</p>
          <div>${safeBody}</div>
          ${
            safeOriginal
              ? `<hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb" />
                 <p style="font-size:12px;color:#6b7280">پیام شما:</p>
                 <blockquote style="margin:0;padding:12px 16px;border-right:3px solid #8b5cf6;background:#f9fafb;color:#4b5563;font-size:13px">
                   ${safeOriginal}
                 </blockquote>`
              : ""
          }
          <p style="margin-top:24px;font-size:12px;color:#6b7280">— تیم پک‌ساز</p>
        </div>
      `,
    });

    if (result.error) {
      return { sent: false, reason: result.error.message };
    }

    return { sent: true, id: result.data?.id ?? null };
  } catch (error) {
    return { sent: false, reason: (error as Error).message };
  }
};
