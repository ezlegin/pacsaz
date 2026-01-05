import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { MostUsage } from "./Onboarding";

const Step3 = ({
  setUsageGoal,
}: {
  setUsageGoal: (val: MostUsage) => void;
}) => {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center">
        هدف شما از استفاده از پک ساز چیست؟
      </p>
      <ToggleGroup
        dir="rtl"
        type="single"
        variant="outline"
        spacing={2}
        size="lg"
        className="flex-wrap"
        onValueChange={(val: MostUsage) => setUsageGoal(val)}
      >
        {usageGoals.map((i, idx) => (
          <ToggleGroupItem
            key={idx}
            value={i.key}
            className="cursor-pointer w-full"
          >
            {i.title}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default Step3;

const usageGoals: {
  title: string;
  key: MostUsage;
}[] = [
  { title: "پروژه‌های واقعی", key: "projects" },
  { title: "تمرین و یادگیری", key: "practice" },
  { title: "نمونه کار (Portfolio)", key: "portfolio" },
  { title: "سرگرمی", key: "hobby" },
  { title: "سایر", key: "other" },
];
