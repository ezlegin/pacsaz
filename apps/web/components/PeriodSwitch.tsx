import { Badge } from "@workspace/ui/components/badge";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import React from "react";
import { SubPeriod } from "./SubscriptionList";

const PeriodSwitch = ({
  isAnnual,
  setPeriod,
}: {
  isAnnual: boolean;
  setPeriod: (val: SubPeriod) => void;
}) => {
  return (
    <div className="flex gap-2 items-center mx-auto w-fit">
      <Label className="w-32 flex justify-end">
        <Badge dir="ltr" variant={"destructive"}>
          -30%
        </Badge>
        سالیانه
      </Label>
      <Switch
        onCheckedChange={(val: boolean) => {
          if (val) {
            setPeriod("annual");
          } else {
            setPeriod("monthly");
          }
        }}
        checked={isAnnual}
        dir="ltr"
      />
      <Label className="w-32">ماهیانه</Label>
    </div>
  );
};

export default PeriodSwitch;
