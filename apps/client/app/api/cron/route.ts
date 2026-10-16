import { NextRequest, NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/notifications/cron-auth";
import { runExpiryWarnings } from "@/lib/notifications/jobs/expiry";
import { runDownloadWarnings } from "@/lib/notifications/jobs/downloads";
import { runMonthlyMarketing } from "@/lib/notifications/jobs/marketing";
import { isMailConfigured } from "@/lib/notifications/mail";

/**
 * Scheduled notification endpoint.
 *
 * Driven by an external scheduler (cron-job.org), not by Vercel Cron, so the
 * secret is checked here instead of relying on a platform-provided header.
 *
 *   POST /api/cron?task=daily    subscription-expiry + download-quota warnings
 *   POST /api/cron?task=monthly  mints the month's coupon and emails it
 *   POST /api/cron               runs every task (useful for a manual catch-up)
 *
 * Every task is idempotent: recipients are deduped through `NotificationLog`
 * and the monthly coupon is deduped on its unique campaign tag. A repeated or
 * overlapping trigger therefore produces no duplicate email.
 *
 * The response reports per-task counts so the scheduler's run log is enough to
 * tell "nothing to do" apart from "everything failed".
 */

export const dynamic = "force-dynamic";

/** Sequential provider calls need headroom on a serverless function. */
export const maxDuration = 300;

const TASKS = ["daily", "monthly"] as const;
type Task = (typeof TASKS)[number];

type TaskResult = {
  task: Task;
  ok: boolean;
  summary?: unknown;
  error?: string;
};

const runTask = async (task: Task): Promise<TaskResult> => {
  try {
    if (task === "daily") {
      const [expiry, downloads] = await Promise.all([
        runExpiryWarnings(),
        runDownloadWarnings(),
      ]);
      return { task, ok: true, summary: { expiry, downloads } };
    }

    return { task, ok: true, summary: await runMonthlyMarketing() };
  } catch (error) {
    // One failing task must not hide the result of the other.
    console.error(`Cron task "${task}" failed:`, error);
    return { task, ok: false, error: (error as Error).message };
  }
};

export const POST = async (request: NextRequest) => {
  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET is not set, so /api/cron refuses every request.");
    return NextResponse.json(
      { error: "CRON_SECRET is not configured on the server." },
      { status: 503 },
    );
  }

  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const requested = request.nextUrl.searchParams.get("task");
  const selected: Task[] =
    requested === null
      ? [...TASKS]
      : TASKS.includes(requested as Task)
        ? [requested as Task]
        : [];

  if (selected.length === 0) {
    return NextResponse.json(
      { error: `Unknown task "${requested}".`, availableTasks: TASKS },
      { status: 400 },
    );
  }

  const startedAt = new Date();
  const results = await Promise.all(selected.map(runTask));

  const anyFailed = results.some((result) => !result.ok);

  return NextResponse.json(
    {
      ranAt: startedAt.toISOString(),
      durationMs: Date.now() - startedAt.getTime(),
      mailConfigured: isMailConfigured(),
      results,
    },
    // A partial failure still returns 200/207-style JSON so the scheduler's log
    // shows which task broke; cron-job.org treats 5xx as a failed run.
    { status: anyFailed ? 500 : 200 },
  );
};
