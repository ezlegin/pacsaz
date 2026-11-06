"use client";

import {
  extendSubscription,
  resetSubscriptionDownloads,
  setSubscriptionActive,
} from "@/actions/subscription";
import { ActionResult } from "@/lib/actionError";
import { handleRes } from "@repo/lib/utils/handleRes";
import { Button } from "@repo/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover";
import { Separator } from "@repo/ui/components/separator";
import { Spinner } from "@repo/ui/components/spinner";
import { CalendarPlus, MoreHorizontal, Power, PowerOff, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/** Row menu for a subscription: extend it, switch it on or off, reset its downloads. */
const SubscriptionActions = ({
  planId,
  active,
  downloaded,
}: {
  planId: number;
  active: boolean;
  downloaded: number;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<ActionResult>) =>
    startTransition(async () => {
      const res = await fn();
      handleRes(res, {
        onSuccess: () => {
          setOpen(false);
          router.refresh();
        },
      });
    });

  const item = "w-full justify-start gap-2 font-normal";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Subscription actions"
          className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-gray-200 hover:text-foreground"
        >
          {pending ? <Spinner isLoading /> : <MoreHorizontal size={14} />}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 p-1.5">
        <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Extend by</p>
        {[1, 3, 12].map((months) => (
          <Button
            key={months}
            variant="ghost"
            size="sm"
            className={item}
            disabled={pending}
            onClick={() => run(() => extendSubscription(planId, months))}
          >
            <CalendarPlus />
            {months === 12 ? "1 year" : `${months} month${months > 1 ? "s" : ""}`}
          </Button>
        ))}

        <Separator className="my-1.5" />

        <Button
          variant="ghost"
          size="sm"
          className={item}
          disabled={pending}
          onClick={() => run(() => setSubscriptionActive(planId, !active))}
        >
          {active ? <PowerOff /> : <Power />}
          {active ? "Deactivate" : "Activate"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={item}
          disabled={pending || downloaded === 0}
          onClick={() => run(() => resetSubscriptionDownloads(planId))}
        >
          <RotateCcw />
          Reset downloads ({downloaded})
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default SubscriptionActions;
