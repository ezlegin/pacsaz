"use client";

import Step1 from "@/components/onboarding/Step1";
import Step2 from "@/components/onboarding/Step2";
import Step3 from "@/components/onboarding/Step3";
import PacsazLogo from "@/components/PacsazLogo";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { useState } from "react";
import Step4 from "./Step4";
import { useLoading } from "@repo/lib/utils/useLoading";
import { UserType } from "@repo/db";

export type MostUsage =
  | "practice"
  | "projects"
  | "portfolio"
  | "hobby"
  | "other";

export type PersonaData = {
  email: string;
  firstName: string;
  lastName: string | undefined;
};

const Onboarding = () => {
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [personaData, setPersonaData] = useState<PersonaData | null>(null);
  const [usageGoal, setUsageGoal] = useState<MostUsage | null>(null);
  const { startLoading, stopLoading, isLoading } = useLoading();

  const isIndividual = userType === "student" || userType === "designer";

  const data = {
    userType,
    personaData,
    usageGoal,
  };

  const onSubmit = () => {
    startLoading();
    console.log(data);
    stopLoading();
  };

  const disableButton =
    onboardingStep === 1
      ? !userType
      : onboardingStep === 2
        ? !personaData
        : !usageGoal;

  return (
    <Card className="w-full flex flex-col gap-4 items-center max-w-2xl px-5 z-10 pt-4">
      <div className="flex justify-between items-center w-full">
        <div className="flex gap-3 items-center">
          <PacsazLogo />
          <h1 className="font-semibold text-lg">به پک ساز خوش آمدید!</h1>
        </div>
        <div className="flex items-center gap-3">
          <div dir="ltr" className="text-xs text-muted-foreground font-medium">
            {onboardingStep} / 4
          </div>
          <Button
            variant={disableButton ? "outline" : "default"}
            disabled={disableButton || isLoading}
            onClick={() =>
              setOnboardingStep((p) => {
                if (p === 4) {
                  onSubmit();
                  return p;
                }

                return p + 1;
              })
            }
          >
            {onboardingStep === 4 ? "پذیرش و ثبت نام" : "ادامه"}
          </Button>
        </div>
      </div>

      <Separator className="mb-3" />

      {onboardingStep === 1 && (
        <Step1 userType={userType} setUserType={setUserType} />
      )}
      {onboardingStep === 2 && (
        <Step2 isIndividual={isIndividual} setPersonaData={setPersonaData} />
      )}
      {onboardingStep === 3 && <Step3 setUsageGoal={setUsageGoal} />}

      {onboardingStep === 4 && <Step4 />}
    </Card>
  );
};

export default Onboarding;
