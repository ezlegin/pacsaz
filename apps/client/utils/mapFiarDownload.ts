import { PlanFairDownload, PlanPeriod } from "@repo/lib/data/plans";

export function mapFiarDownload(
  fairDownload: PlanFairDownload,
  period: PlanPeriod,
) {
  return period === "annual"
    ? fairDownload.annual
    : period === "threeMonth"
      ? fairDownload.threeMonth
      : fairDownload.monthly;
}
