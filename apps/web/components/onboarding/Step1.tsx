import { UserType } from "@/app/login/onboarding/page";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import React from "react";

interface Props {
  userType: UserType | null;
  setUserType: (val: UserType) => void;
}
const Step1 = ({ userType, setUserType }: Props) => {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center">
        کدام یک شما را به بهترین شکل توصیف می کند؟
      </p>
      <ToggleGroup
        value={userType ?? ""}
        dir="rtl"
        type="single"
        variant="outline"
        spacing={2}
        size="lg"
        className="flex-wrap"
        onValueChange={(val: UserType) => setUserType(val)}
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

const userTypes: {
  title: string;
  key: UserType;
}[] = [
  { title: "طراح گرافیک", key: "designer" },
  { title: "استودیو طراحی", key: "designStudio" },
  { title: "دانشجو/دانش‌آموز", key: "student" },
  { title: "چاپخانه", key: "printHouse" },
  { title: "قالب سازی", key: "dielineMaker" },
  { title: "تولیدی بسته بندی", key: "packagingFactory" },
];
