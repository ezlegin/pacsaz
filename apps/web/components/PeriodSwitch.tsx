import { Badge } from "@repo/ui/components/badge";
import { Label } from "@repo/ui/components/label";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { SubPeriod } from "./SubscriptionList";
import { annualPlanDisocunt } from "@/data/plan";

const PeriodSwitch = ({
  setPeriod,
  period,
}: {
  setPeriod: (val: SubPeriod) => void;
  period: SubPeriod;
}) => {
  const items = [
    { label: <div>ماهیانه</div>, value: "monthly" },
    { label: <div>3 ماهه</div>, value: "3-month" },
    {
      label: (
        <div className="flex justify-end gap-1">
          <Label className="cursor-pointer">سالیانه</Label>
          <Badge dir="ltr" variant={"destructive"}>
            -{annualPlanDisocunt * 100}%
          </Badge>
        </div>
      ),
      value: "annual",
    },
  ];
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
        {items.map((i, idx) => (
          <ToggleGroupItem className="cursor-pointer" key={idx} value={i.value}>
            {i.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default PeriodSwitch;
