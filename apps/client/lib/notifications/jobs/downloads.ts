import { prisma } from "@repo/db";
import { notifyDownloadsNearLimit } from "../send";

/**
 * Warns users whose fair-download quota is nearly used up.
 *
 * Meant to run once a day. Idempotent: a plan is warned about exactly once
 * (deduped on `downloads-near-limit:<planId>`), because the condition stays true
 * for every download after the threshold — without the log this job would send
 * a reminder on every single run.
 */

/**
 * How many downloads may remain before the user is warned. Two is deliberately
 * small: it leaves room to finish the current project but still nudges towards
 * an upgrade before the quota hits zero.
 */
const THRESHOLD_REMAINING = 2;

/**
 * Upper bound on recipients per run. The threshold is evaluated in memory, so
 * the query cannot filter on it; this keeps a request bounded when the user base
 * grows, and the next run continues where this one stopped.
 */
const BATCH_SIZE = 100;

export type DownloadsJobSummary = {
  /** Active plans inspected in this run. */
  scanned: number;
  /** Plans that were at or below the threshold. */
  due: number;
  sent: number;
  skipped: number;
  failed: number;
  /** True when this run hit `BATCH_SIZE`, so more plans remain unscanned. */
  truncated: boolean;
};

export const runDownloadWarnings = async (): Promise<DownloadsJobSummary> => {
  const plans = await prisma.plan.findMany({
    where: {
      status: "active",
      endsAt: { gte: new Date() },
      // A quota of 0 means "unlimited/not set", which can never be "nearly used".
      fairDownload: { gt: 0 },
      // Bounded in the database: keeps whole zeros out of the batch so a large
      // installed base does not crowd out the plans that actually need a nudge.
      downloaded: { gt: 0 },
    },
    include: { user: true },
    orderBy: { endsAt: "asc" },
    take: BATCH_SIZE,
  });

  const summary: DownloadsJobSummary = {
    scanned: plans.length,
    due: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    truncated: plans.length === BATCH_SIZE,
  };

  for (const plan of plans) {
    const remaining = plan.fairDownload - plan.downloaded;
    if (remaining > THRESHOLD_REMAINING) continue;

    summary.due += 1;

    const result = await notifyDownloadsNearLimit({
      userId: plan.userId,
      planId: plan.id,
      email: plan.user.email,
      phoneNumber: plan.user.phoneNumber,
      fullName: plan.user.fullName,
      planTitle: plan.title,
      downloaded: plan.downloaded,
      fairDownload: plan.fairDownload,
      remaining: Math.max(0, remaining),
    });

    if (result.status === "sent") summary.sent += 1;
    else if (result.status === "failed") summary.failed += 1;
    else summary.skipped += 1;
  }

  return summary;
};
