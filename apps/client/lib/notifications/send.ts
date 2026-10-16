import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
  prisma,
} from "@repo/db";
import { sendMail } from "./mail";
import {
  downloadsNearLimitEmail,
  formatJalali,
  marketingEmail,
  paymentFailedEmail,
  paymentSuccessEmail,
  subscriptionExpiringEmail,
  welcomeEmail,
} from "./templates";
import { buildDownloadsSms, buildExpiringSms, sendSms } from "./sms";

/**
 * The single place that decides whether a notification still needs to go out.
 *
 * Cron endpoints are stateless and may overlap or be retried, so "have we
 * already sent this?" is answered by the `NotificationLog` table rather than by
 * memory. Every send is claimed first; the claim is attempted optimistically and
 * a unique-constraint violation (P2002) is treated as "already claimed", which
 * makes concurrent runs safe without a distributed lock.
 */

export type SendStatus = "sent" | "skipped" | "failed";

export type NotifyChannelsResult = {
  /** Did at least one channel deliver, or was everything already sent? */
  status: SendStatus;
  email?: SendStatus;
  sms?: SendStatus;
};

/** Prisma's code for a unique-constraint violation. */
const UNIQUE_VIOLATION = "P2002";

const claim = async ({
  userId,
  key,
  type,
  channel,
}: {
  userId: number;
  key: string;
  type: NotificationType;
  channel: NotificationChannel;
}): Promise<boolean> => {
  const alreadySent = await prisma.notificationLog.findFirst({
    where: { userId, key, channel },
    select: { id: true },
  });
  if (alreadySent) return false;

  try {
    await prisma.notificationLog.create({
      data: { userId, key, type, channel, status: "sent" },
    });
    return true;
  } catch (error) {
    if ((error as { code?: string }).code === UNIQUE_VIOLATION) return false;
    throw error;
  }
};

/** Rewrites the claim row with the real outcome once the provider answered. */
const settle = async ({
  userId,
  key,
  channel,
  status,
  detail,
}: {
  userId: number;
  key: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  detail?: string;
}) => {
  await prisma.notificationLog
    .update({
      where: { userId_key_channel: { userId, key, channel } },
      data: { status, detail: detail ?? null },
    })
    .catch((error) => {
      // Losing the outcome must not fail the batch; the notification itself was
      // still attempted and the failure is already in the runtime logs.
      console.error("Failed to record notification outcome:", error);
    });
};

const emailLeg = async ({
  userId,
  key,
  type,
  to,
  subject,
  html,
}: {
  userId: number;
  key: string;
  type: NotificationType;
  to: string;
  subject: string;
  html: string;
}): Promise<SendStatus> => {
  if (!to) {
    return "skipped";
  }

  const claimed = await claim({ userId, key, type, channel: "email" });
  if (!claimed) return "skipped";

  const result = await sendMail({ to, subject, html });
  const status: SendStatus = result.ok ? "sent" : "failed";

  await settle({
    userId,
    key,
    channel: "email",
    status: result.ok ? "sent" : "failed",
    detail: result.ok ? (result.id ?? undefined) : result.reason,
  });

  if (!result.ok) console.error(`Email "${type}" failed for ${to}: ${result.reason}`);
  return status;
};

const smsLeg = async ({
  userId,
  key,
  type,
  phoneNumber,
  send: smsSender,
}: {
  userId: number;
  key: string;
  type: NotificationType;
  phoneNumber: string;
  send: () => Promise<{ ok: true } | { ok: false; reason: string }>;
}): Promise<SendStatus> => {
  if (!phoneNumber) return "skipped";

  const claimed = await claim({ userId, key, type, channel: "sms" });
  if (!claimed) return "skipped";

  const result = await smsSender();

  await settle({
    userId,
    key,
    channel: "sms",
    status: result.ok ? "sent" : "failed",
    detail: result.ok ? undefined : result.reason,
  });

  if (!result.ok) {
    console.error(`SMS "${type}" failed for ${phoneNumber}: ${result.reason}`);
  }
  return result.ok ? "sent" : "failed";
};

const summarize = (...statuses: SendStatus[]): SendStatus => {
  if (statuses.includes("sent")) return "sent";
  if (statuses.includes("failed")) return "failed";
  return "skipped";
};

//! ---------------------------------------------------------------------------
//! Public notifications
//! ---------------------------------------------------------------------------

/** Sent once, after the user finishes onboarding and an address is on file. */
export const notifyWelcome = async ({
  userId,
  email,
  fullName,
}: {
  userId: number;
  email: string;
  fullName: string;
}): Promise<NotifyChannelsResult> => {
  const { subject, html } = welcomeEmail({ fullName });

  const emailStatus = await emailLeg({
    userId,
    key: "welcome",
    type: "welcome",
    to: email,
    subject,
    html,
  });

  return { status: summarize(emailStatus), email: emailStatus };
};

/** Warns that an active subscription ends within the next 48 hours. */
export const notifySubscriptionExpiring = async ({
  userId,
  planId,
  email,
  phoneNumber,
  fullName,
  planTitle,
  endsAt,
  daysLeft,
  downloads,
}: {
  userId: number;
  /** Keyed per plan, so renewing earns a fresh warning for the new plan. */
  planId: number;
  email: string;
  phoneNumber: string;
  fullName: string;
  planTitle: string;
  endsAt: Date;
  daysLeft: number;
  downloads: number;
}): Promise<NotifyChannelsResult> => {
  const key = `subscription-expiring:${planId}`;

  const { subject, html } = subscriptionExpiringEmail({
    fullName,
    planTitle,
    endsAt,
    daysLeft,
    downloads,
  });

  const emailStatus = await emailLeg({
    userId,
    key,
    type: "subscriptionExpiring",
    to: email,
    subject,
    html,
  });

  const smsStatus = await smsLeg({
    userId,
    key,
    type: "subscriptionExpiring",
    phoneNumber,
    send: () =>
      sendSms({
        phone: phoneNumber,
        message: buildExpiringSms({
          planTitle,
          endsAtLabel: formatJalali(endsAt),
        }),
      }),
  });

  return { status: summarize(emailStatus, smsStatus), email: emailStatus, sms: smsStatus };
};

/** Warns that the fair-download quota of the active plan is nearly used up. */
export const notifyDownloadsNearLimit = async ({
  userId,
  planId,
  email,
  phoneNumber,
  fullName,
  planTitle,
  downloaded,
  fairDownload,
  remaining,
}: {
  userId: number;
  /** Keyed per plan: one warning per subscription period, not per download. */
  planId: number;
  email: string;
  phoneNumber: string;
  fullName: string;
  planTitle: string;
  downloaded: number;
  fairDownload: number;
  remaining: number;
}): Promise<NotifyChannelsResult> => {
  const key = `downloads-near-limit:${planId}`;

  const { subject, html } = downloadsNearLimitEmail({
    fullName,
    planTitle,
    downloaded,
    fairDownload,
    remaining,
  });

  const emailStatus = await emailLeg({
    userId,
    key,
    type: "downloadsNearLimit",
    to: email,
    subject,
    html,
  });

  const smsStatus = await smsLeg({
    userId,
    key,
    type: "downloadsNearLimit",
    phoneNumber,
    send: () =>
      sendSms({
        phone: phoneNumber,
        message: buildDownloadsSms({ remaining, planTitle }),
      }),
  });

  return { status: summarize(emailStatus, smsStatus), email: emailStatus, sms: smsStatus };
};

/**
 * Receipt for a payment attempt.
 *
 * Keyed per payment id so a replayed ZarinPal callback cannot mail the user
 * twice about the same transaction.
 */
export const notifyPaymentResult = async ({
  userId,
  email,
  fullName,
  paymentId,
  succeeded,
  planTitle,
  amount,
  periodLabel,
  endsAt,
  fairDownload,
}: {
  userId: number;
  email: string;
  fullName: string;
  paymentId: number;
  succeeded: boolean;
  planTitle: string;
  amount: number;
  periodLabel?: string;
  endsAt?: Date;
  fairDownload?: number;
}): Promise<NotifyChannelsResult> => {
  const key = `payment-result:${paymentId}`;

  const { subject, html } =
    succeeded && endsAt !== undefined && fairDownload !== undefined
      ? paymentSuccessEmail({
          fullName,
          planTitle,
          amount,
          periodLabel: periodLabel ?? "",
          endsAt,
          fairDownload,
        })
      : paymentFailedEmail({ fullName, planTitle, amount });

  const emailStatus = await emailLeg({
    userId,
    key,
    type: "paymentResult",
    to: email,
    subject,
    html,
  });

  return { status: summarize(emailStatus), email: emailStatus };
};

/** Monthly campaign email carrying this month's coupon code. */
export const notifyMarketing = async ({
  userId,
  email,
  fullName,
  code,
  percent,
  expiresAt,
  limit,
  campaign,
}: {
  userId: number;
  email: string;
  fullName: string;
  code: string;
  percent: number;
  expiresAt: Date;
  limit: number;
  campaign: string;
}): Promise<NotifyChannelsResult> => {
  const key = `marketing:${campaign}`;

  const { subject, html } = marketingEmail({
    fullName,
    code,
    percent,
    expiresAt,
    limit,
  });

  const emailStatus = await emailLeg({
    userId,
    key,
    type: "marketing",
    to: email,
    subject,
    html,
  });

  return { status: summarize(emailStatus), email: emailStatus };
};
