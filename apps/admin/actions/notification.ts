"use server";

import {
  NotificationFormType,
  notificationFormSchema,
} from "@/lib/validationSchema/validatoinSchema";
import { prisma } from "@repo/db";

/**
 * Creates or updates the single announcement-bar row.
 *
 * `id: 1` is the singleton both this app and the client site read, so saving here
 * changes the bar on the public site too — no redeploy, because the client reads
 * it per request.
 */
export const saveNotification = async (data: NotificationFormType) => {
  try {
    // The form validates as well, but a server action is a public endpoint, so
    // never trust the arguments it receives.
    const parsed = notificationFormSchema.safeParse(data);
    if (!parsed.success) return { error: "Please fill in the notification text." };

    const payload = {
      text: parsed.data.text,
      // Empty strings from the form mean "not set", not "empty value".
      ctaTitle: parsed.data.ctaTitle?.trim() || null,
      ctaLink: parsed.data.ctaLink?.trim() || null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      active: parsed.data.active,
    };

    await prisma.notificationBar.upsert({
      where: { id: 1 },
      create: { id: 1, ...payload },
      update: payload,
    });

    return { success: "Notification Saved." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).name };
  }
};
