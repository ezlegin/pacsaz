import { OnboardingFormType } from "@/lib/validatoinSchema";
import { UserType } from "@repo/db";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import React from "react";
import { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<OnboardingFormType, any, OnboardingFormType>;
}

const Step1 = ({ form }: Props) => {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center">
        کدام یک شما را به بهترین شکل توصیف می کند؟
      </p>
      <ToggleGroup
        dir="rtl"
        type="single"
        variant="outline"
        spacing={2}
        size="lg"
        className="flex-wrap"
        onValueChange={(val: UserType) => form.setValue("userType", val)}
      >
        {userTypes.map((i, idx) => (
          <ToggleGroupItem
            key={idx}
            value={i.key}
            className="cursor-pointer w-full "
          >
            {i.title}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default Step1;

export const userTypes: {
  title: string;
  key: UserType;
}[] = [
  { title: "طراح گرافیک", key: "designer" },
  { title: "استودیو طراحی", key: "designStudio" },
  { title: "دانشجو/دانش‌آموز", key: "student" },
  { title: "چاپخانه", key: "printHouse" },
  { title: "قالب سازی", key: "dielineMaker" },
  { title: "تولیدی بسته بندی", key: "packagingFactory" },
  { title: "سایر", key: "other" },
];
