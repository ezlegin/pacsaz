import { FairDownload, PlanPeriod } from "@repo/db";

export function mapFiarDownload(
  fairDownload: FairDownload,
  period: PlanPeriod,
) {
  return period === "annual"
    ? fairDownload.annual
    : period === "threeMonth"
      ? fairDownload.threeMonth
      : fairDownload.monthly;
}
