import { SubPeriod } from "@/components/SubscriptionList";
import { PlanFairDownload } from "@/data/plan";

export function mapFiarDownload(
  fairDownload: PlanFairDownload,
  period: SubPeriod
) {
  return period === "annual"
    ? fairDownload.annual
    : period === "3-month"
      ? fairDownload.threeMonth
      : fairDownload.monthly;
}
