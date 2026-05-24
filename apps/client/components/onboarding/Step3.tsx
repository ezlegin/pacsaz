import { OnboardingFormType } from "@/lib/validatoinSchema";
import { UsageGoal } from "@repo/db";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { UseFormReturn } from "react-hook-form";

const Step3 = ({
  form,
}: {
  form: UseFormReturn<OnboardingFormType, any, OnboardingFormType>;
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
        className="flex-wrap w-full"
        onValueChange={(val: UsageGoal) => form.setValue("usageGoal", val)}
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
  key: UsageGoal;
}[] = [
  { title: "پروژه‌های واقعی", key: "projects" },
  { title: "تمرین و یادگیری", key: "practice" },
  { title: "نمونه کار (Portfolio)", key: "portfolio" },
  { title: "سرگرمی", key: "hobby" },
  { title: "سایر", key: "other" },
];
