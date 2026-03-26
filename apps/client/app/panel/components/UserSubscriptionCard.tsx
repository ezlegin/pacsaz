"use client";

import { mapUserPlanTitle } from "@/utils/mapUserPlanTitle";
import { Button } from "@repo/ui/components/button";
import Card from "@repo/ui/components/custom/Card";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/components/dialog";
import { RotateCw, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import UpgradeSubscription from "../../../components/UpgradeSubscription";
import { Plan } from "@repo/db";

const UserSubscriptionCard = ({ userPlan }: { userPlan: Plan }) => {
  const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);

  return (
    <>
      <Dialog open={openUpgradeDialog} onOpenChange={setOpenUpgradeDialog}>
        <DialogContent showCloseButton={false} className="sm:max-w-2xl">
          <DialogTitle className="sr-only" />
          <UpgradeSubscription userPlan={userPlan} />
        </DialogContent>
      </Dialog>

      <Card
        className="flex justify-between items-center col-span-3"
        primaryTheme
      >
        <div>
          <div className="text-sm text-muted-foreground">پلن</div>
          <div className="text-2xl font-semibold">
            {mapUserPlanTitle(userPlan.key)}
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            36 روز باقی مانده
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Link
            href={`/payment?plan=${userPlan.key}&period=${userPlan.period}`}
          >
            <Button variant="primaryForeground" className="w-full" size={"sm"}>
              <RotateCw />
              تمدید اشتراک
            </Button>
          </Link>

          {userPlan.level !== 3 && (
            <Button
              className="w-full"
              variant="gradient"
              onClick={() => setOpenUpgradeDialog(true)}
              size={"sm"}
            >
              <Zap />
              ارتفا اشتراک
            </Button>
          )}
        </div>
      </Card>
    </>
  );
};

export default UserSubscriptionCard;
