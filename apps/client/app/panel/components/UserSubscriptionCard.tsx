"use client";

import { mapPlanTitle } from "@/utils/mapPlanTitle";
import { Plan } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import Card from "@repo/ui/components/custom/Card";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/components/dialog";
import { differenceInDays } from "date-fns";
import { RotateCw, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import UpgradeSubscription, {
  TarrifType,
} from "../../../components/UpgradeSubscription";

const UserSubscriptionCard = ({
  plan,
  tarrif,
}: {
  plan: Plan;
  tarrif: TarrifType[];
}) => {
  const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);

  return (
    <>
      <Dialog open={openUpgradeDialog} onOpenChange={setOpenUpgradeDialog}>
        <DialogContent showCloseButton={false} className="sm:max-w-2xl">
          <DialogTitle className="sr-only" />
          <UpgradeSubscription userPlan={plan} tarrif={tarrif} />
        </DialogContent>
      </Dialog>

      <Card className="flex justify-between items-center" primaryTheme>
        <div>
          <div className="text-sm text-muted-foreground">پلن</div>
          <div className="text-2xl font-semibold">{mapPlanTitle(plan.key)}</div>
          <div className="text-xs text-muted-foreground font-medium">
            {differenceInDays(plan.endsAt, new Date())} روز باقی مانده
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Link href={`/payment?plan=${plan.key}&period=${plan.period}`}>
            <Button variant="primaryForeground" className="w-full" size={"sm"}>
              <RotateCw />
              تمدید اشتراک
            </Button>
          </Link>

          <Button
            className="w-full"
            variant="gradient"
            onClick={() => setOpenUpgradeDialog(true)}
            size={"sm"}
          >
            <Zap />
            ارتفا اشتراک
          </Button>
        </div>
      </Card>
    </>
  );
};

export default UserSubscriptionCard;
