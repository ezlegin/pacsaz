import { Badge } from "@repo/ui/components/badge";
import { Label } from "@repo/ui/components/label";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { SubPeriod } from "./SubscriptionList";

const PeriodSwitch = ({
  setPeriod,
  period,
}: {
  setPeriod: (val: SubPeriod) => void;
  period: SubPeriod;
}) => {
  return (
    <div className="flex gap-2 items-center mx-auto w-fit">
      <ToggleGroup
        spacing={2}
        variant={"outline"}
        dir="rtl"
        value={period}
        type="single"
        onValueChange={(val: SubPeriod | "") => {
          if (val === "") return;
          setPeriod(val);
        }}
      >
        <ToggleGroupItem value={"monthly"}>ماهیانه</ToggleGroupItem>
        <ToggleGroupItem value={"3-month"}>3 ماهه</ToggleGroupItem>
        <ToggleGroupItem value={"annual"}>
          <Label className="flex justify-end">
            سالیانه
            <Badge dir="ltr" variant={"destructive"}>
              -30%
            </Badge>
          </Label>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default PeriodSwitch;
