import { Resend } from "resend";

/**
 * Transactional and campaign email for the client app.
 *
 * The Resend SDK is instantiated lazily so that importing this module never
 * throws when `RESEND_API_KEY` is missing. In that case every send resolves to
 * `{ ok: false }` and the caller records a `failed` notification row, which
 * keeps the cron endpoints observable instead of silently dropping mail.
 */

const fromEmail =
  process.env.RESEND_FROM_EMAIL ?? "Pacsaz <onboarding@resend.dev>";

let client: Resend | null | undefined;

const getClient = (): Resend | null => {
  if (client !== undefined) return client;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      "RESEND_API_KEY is not set for this deployment, so no email was sent. [lib/notifications/mail.ts]",
    );
    client = null;
    return client;
  }

  client = new Resend(apiKey);
  return client;
};

export const isMailConfigured = () => Boolean(process.env.RESEND_API_KEY);

export type SendMailResult =
  | { ok: true; id: string | null }
  | { ok: false; reason: string };

/**
 * Sends one HTML email. Never throws: delivery problems are returned so the
 * caller can persist a `failed` row and carry on with the remaining recipients.
 */
export const sendMail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendMailResult> => {
  const resend = getClient();
  if (!resend) return { ok: false, reason: "RESEND_API_KEY is not configured." };

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });

    if (result.error) return { ok: false, reason: result.error.message };

    return { ok: true, id: result.data?.id ?? null };
  } catch (error) {
    return { ok: false, reason: (error as Error).message };
  }
};
