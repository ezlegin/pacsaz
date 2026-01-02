"use client";

import { mapUserPlanTitle, testUser } from "@/data/user";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { RotateCw, Zap } from "lucide-react";
import { useState } from "react";
import Card from "./Card";
import UpgradeSubscription from "./UpgradeSubscription";

const UserSubscriptionCard = () => {
  const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);

  return (
    <>
      <Dialog open={openUpgradeDialog} onOpenChange={setOpenUpgradeDialog}>
        <DialogContent showCloseButton={false} className="sm:max-w-2xl">
          <DialogTitle className="sr-only" />
          <UpgradeSubscription />
        </DialogContent>
      </Dialog>

      <Card
        className="flex justify-between items-center col-span-3"
        primaryTheme
      >
        <div>
          <div className="text-sm text-muted-foreground">پلن</div>
          <div className="text-2xl font-semibold">
            {mapUserPlanTitle(testUser.plan.key)}
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            36 روز باقی مانده
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Button
            variant="primaryForeground"
            onClick={() => setOpenUpgradeDialog(true)}
            className="w-full"
            size={"sm"}
          >
            <RotateCw />
            تمدید اشتراک
          </Button>

          {testUser.plan.level !== 3 && (
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
