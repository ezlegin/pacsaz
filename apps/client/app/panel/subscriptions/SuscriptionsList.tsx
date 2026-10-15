import PlanStatus from "@/components/PlanStatus";
import { mapPeriodLabel } from "@/utils/mapPeriodLabel";
import { Payment, Plan } from "@repo/db";
import { cn } from "@repo/ui/lib/utils";
import { formatDate } from "date-fns";
import { CreditCard, Flag } from "lucide-react";
import { EmptyState, PanelCard, SectionHeader, Td, Th } from "../components/PanelUI";

interface PlanType extends Plan {
  payment: Payment | null;
}

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

const COLUMNS = [
  "پلن",
  "دوره",
  "شروع",
  "پایان",
  "سهمیه",
  "دانلود شده",
  "آخرین دانلود",
  "وضعیت",
  "پرداخت",
];

function SubscriptionsList({ data }: { data: PlanType[] }) {
  return (
    <PanelCard>
      <SectionHeader
        icon={Flag}
        title="سوابق اشتراک"
        description="تاریخچه‌ی کامل پلن‌هایی که فعال کرده‌ای"
      />

      {data.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="هنوز اشتراکی فعال نکرده‌ای"
          description="با فعال‌سازی اشتراک، به همه‌ی قالب‌ها و ابزارهای حرفه‌ای پک‌ساز دسترسی پیدا می‌کنی."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr>
                {COLUMNS.map((label, index) => (
                  <Th key={label} className={index === 0 ? "" : "text-center"}>
                    {label}
                  </Th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {data.map((plan) => {
                const usage =
                  plan.fairDownload > 0
                    ? Math.min(
                        Math.round((plan.downloaded / plan.fairDownload) * 100),
                        100,
                      )
                    : 0;

                return (
                  <tr
                    key={plan.id}
                    className="transition-colors hover:bg-primary/[0.03]"
                  >
                    <Td className="font-bold">{plan.title}</Td>

                    <Td className="text-center">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[11px]">
                        {mapPeriodLabel(plan.period)}
                      </span>
                    </Td>

                    <Td className="text-center text-muted-foreground">
                      {formatDate(plan.startedAt, "yyyy/MM/dd")}
                    </Td>

                    <Td className="text-center text-muted-foreground">
                      {formatDate(plan.endsAt, "yyyy/MM/dd")}
                    </Td>

                    <Td className="text-center">{fa(plan.fairDownload)}</Td>

                    <Td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
                          <span
                            style={{ width: `${usage}%` }}
                            className={cn(
                              "block h-full rounded-full",
                              usage >= 90
                                ? "bg-gradient-to-l from-rose-500 to-red-500"
                                : "bg-gradient-to-l from-violet-500 to-purple-600",
                            )}
                          />
                        </span>
                        <span className="text-[11px] font-medium">
                          {fa(plan.downloaded)}
                        </span>
                      </div>
                    </Td>

                    <Td className="text-center text-muted-foreground">
                      {plan.lastDownload
                        ? formatDate(plan.lastDownload, "yyyy/MM/dd")
                        : "—"}
                    </Td>

                    <Td className="text-center">
                      <div className="flex justify-center">
                        <PlanStatus status={plan.status} />
                      </div>
                    </Td>

                    <Td className="text-center">
                      {plan.payment ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <CreditCard className="size-3.5" />
                          {fa(plan.payment.id)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PanelCard>
  );
}

export default SubscriptionsList;
