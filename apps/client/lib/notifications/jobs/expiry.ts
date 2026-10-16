import { prisma } from "@repo/db";
import { differenceInCalendarDays } from "date-fns";
import { notifySubscriptionExpiring } from "../send";

/**
 * Warns users whose active subscription expires within the next 48 hours.
 *
 * Meant to run once a day. It is safe to run more often: each plan is warned
 * about exactly once (deduped on `subscription-expiring:<planId>`), so an extra
 * trigger in the same window sends nothing.
 */

/** Warn when the subscription ends within this window. */
const WARNING_WINDOW_HOURS = 48;

/**
 * Upper bound on recipients per run, so a single request cannot outlive the
 * serverless function limit. If more plans are due, the next run continues:
 * nothing is marked as sent until it actually was.
 */
const BATCH_SIZE = 100;

export type ExpiryJobSummary = {
  /** Plans inside the warning window when the run started. */
  due: number;
  sent: number;
  skipped: number;
  failed: number;
  /** True when `due` exceeded this run's batch, so more work remains. */
  truncated: boolean;
};

export const runExpiryWarnings = async (): Promise<ExpiryJobSummary> => {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + WARNING_WINDOW_HOURS * 60 * 60 * 1000);

  // Counted up front so the response can say truthfully whether this run
  // consumed the whole backlog or the next scheduled run will continue it.
  const totalDue = await prisma.plan.count({
    where: { status: "active", endsAt: { gte: now, lte: windowEnd } },
  });

  const duePlans = await prisma.plan.findMany({
    where: { status: "active", endsAt: { gte: now, lte: windowEnd } },
    include: { user: true },
    orderBy: { endsAt: "asc" },
    take: BATCH_SIZE,
  });

  const summary: ExpiryJobSummary = {
    due: totalDue,
    sent: 0,
    skipped: 0,
    failed: 0,
    truncated: totalDue > duePlans.length,
  };

  for (const plan of duePlans) {
    // A user who never finished onboarding has an empty email address; the
    // helper skips the email leg and the SMS leg still carries the warning.
    const result = await notifySubscriptionExpiring({
      userId: plan.userId,
      planId: plan.id,
      email: plan.user.email,
      phoneNumber: plan.user.phoneNumber,
      fullName: plan.user.fullName,
      planTitle: plan.title,
      endsAt: plan.endsAt,
      daysLeft: Math.max(0, differenceInCalendarDays(plan.endsAt, now)),
      downloads: plan.downloaded,
    });

    if (result.status === "sent") summary.sent += 1;
    else if (result.status === "failed") summary.failed += 1;
    else summary.skipped += 1;
  }

  return summary;
};
