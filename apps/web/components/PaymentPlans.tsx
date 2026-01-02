import Card from "@/components/Card";
import Price from "@/components/Price";
import { PlanKey, plans } from "@/data/subscription";
import { Label } from "@workspace/ui/components/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import PeriodSwitch from "./PeriodSwitch";
import { SubPeriod } from "./SubscriptionList";

interface Props {
  plan: PlanKey;
  period: "monthly" | "annual";
  setPeriod: (val: SubPeriod) => void;
  setPlan: (val: PlanKey) => void;
}

export const PaymentPlans = ({ plan, setPeriod, setPlan, period }: Props) => {
  return (
    <Card className="w-full space-y-5">
      <PeriodSwitch isAnnual={period === "annual"} setPeriod={setPeriod} />

      <RadioGroup
        defaultValue={plan}
        onValueChange={(val: PlanKey) => setPlan(val)}
        dir="rtl"
        className="flex gap-7"
      >
        {plans.map((p, index) => (
          <div className="w-1/3 space-y-3" key={index}>
            <Card
              primaryTheme={p.key === plan}
              className="flex items-start gap-0 p-0 pr-3"
            >
              <div className="pt-3">
                <RadioGroupItem value={p.key} id={p.key} />
              </div>
              <Label
                htmlFor={p.key}
                className="w-full cursor-pointer flex justify-between items-start p-5 pt-3 pr-2 h-full"
              >
                <div className="space-y-1">
                  <div className="text-base">{p.title}</div>
                  <div className="text-xs text-muted-foreground font-normal">
                    {p.shortDescription}
                  </div>
                </div>
              </Label>
            </Card>

            <div className="space-y-3 pt-3">
              <div className="flex justify-between items-end">
                <span className="text-xs text-muted-foreground">تعرفه:</span>

                <Price
                  isAnnual={period === "annual"}
                  price={p.price}
                  size="sm"
                />
              </div>

              <div>
                <Separator />
              </div>

              <div className="flex justify-between items-end">
                <span className="text-xs text-muted-foreground">
                  دانلود منصفانه:
                </span>

                <span className="text-foreground font-medium text-sm">
                  {period === "annual"
                    ? p.fairDownload.annual
                    : p.fairDownload.monthly}{" "}
                  دانلود
                </span>
              </div>
            </div>

            <Separator />

            <ul className="text-xs text-muted-foreground space-y-3">
              {p.features.map((f, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div
                    className={cn(
                      !f.active ? "border-2" : "bg-green-500/80",
                      "w-1.5 h-1.5 rounded-full"
                    )}
                  />
                  {f.value}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </RadioGroup>
    </Card>
  );
};
