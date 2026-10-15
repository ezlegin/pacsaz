"use client";

import { mapPlanTitle } from "@/utils/mapPlanTitle";
import { Plan } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/components/dialog";
import { cn } from "@repo/ui/lib/utils";
import { differenceInDays } from "date-fns";
import { ArrowUpRight, RotateCw, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import UpgradeSubscription, {
  TarrifType,
} from "../../../components/UpgradeSubscription";

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

const PLAN_GRADIENT: Record<string, string> = {
  standard: "from-violet-500 to-purple-500",
  pro: "from-violet-600 to-fuchsia-500",
  organization: "from-indigo-600 to-violet-600",
};

const UserSubscriptionCard = ({
  plan,
  tarrif,
}: {
  plan: Plan;
  tarrif: TarrifType[];
}) => {
  const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);
  const daysLeft = differenceInDays(plan.endsAt, new Date());
  const expiringSoon = daysLeft <= 7;

  return (
    <>
      <Dialog open={openUpgradeDialog} onOpenChange={setOpenUpgradeDialog}>
        <DialogContent showCloseButton={false} className="sm:max-w-2xl">
          <DialogTitle className="sr-only" />
          <UpgradeSubscription userPlan={plan} tarrif={tarrif} />
        </DialogContent>
      </Dialog>

      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-b p-[1.5px]",
          PLAN_GRADIENT[plan.key] ?? "from-violet-500 to-purple-600",
        )}
      >
        <div className="flex h-full flex-col rounded-[calc(1rem-1.5px)] bg-background">
          {/* tinted header */}
          <div className="relative overflow-hidden border-b bg-gradient-to-bl from-primary/[0.08] to-transparent p-5">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 -top-16 size-40 rounded-full bg-primary/15 blur-2xl"
            />

            <div className="relative flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                  <Sparkles className="size-3" />
                  اشتراک فعال
                </span>
                <h2 className="text-xl font-extrabold tracking-tight">
                  پلن {mapPlanTitle(plan.key)}
                </h2>
              </div>

              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold",
                  expiringSoon
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-green-500/10 text-green-600",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    expiringSoon ? "bg-amber-500" : "bg-green-500",
                  )}
                />
                {daysLeft > 0 ? `${fa(daysLeft)} روز مانده` : "منقضی شده"}
              </span>
            </div>
          </div>

          {/* meta rows */}
          <div className="grid flex-1 gap-4 p-5 sm:grid-cols-3">
            {[
              {
                label: "دوره",
                value:
                  plan.period === "monthly"
                    ? "ماهیانه"
                    : plan.period === "threeMonth"
                      ? "۳ ماهه"
                      : "سالیانه",
              },
              { label: "سهمیه دانلود", value: `${fa(plan.fairDownload)} قالب` },
              { label: "سطح پلن", value: fa(plan.level) },
            ].map((row) => (
              <div key={row.label} className="space-y-1">
                <p className="text-[10px] text-muted-foreground">{row.label}</p>
                <p className="text-sm font-bold">{row.value}</p>
              </div>
            ))}
          </div>

          {/* actions */}
          <div className="flex flex-col gap-2 border-t p-5 sm:flex-row">
            <Link
              href={`/payment?plan=${plan.key}&period=${plan.period}`}
              className="flex-1"
            >
              <Button variant="primaryForeground" className="w-full">
                <RotateCw className="size-4" />
                تمدید اشتراک
              </Button>
            </Link>

            <Button
              className="flex-1"
              variant="gradient"
              onClick={() => setOpenUpgradeDialog(true)}
            >
              <Zap className="size-4" />
              ارتقا اشتراک
            </Button>

            <Button variant="outline" size="icon" asChild>
              <Link href="/panel/subscriptions" aria-label="سوابق اشتراک">
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSubscriptionCard;
