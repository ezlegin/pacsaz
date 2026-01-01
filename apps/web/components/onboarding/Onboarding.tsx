"use client";

import Step1 from "@/components/onboarding/Step1";
import Step2 from "@/components/onboarding/Step2";
import Step3 from "@/components/onboarding/Step3";
import PacsazLogo from "@/components/PacsazLogo";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { useState } from "react";

export type UserType =
  | "student"
  | "designer"
  | "designStudio"
  | "printHouse"
  | "dielineMaker"
  | "packagingFactory";

export type PersonaData = {
  email: string;
  fullName: string;
};

export type MostUsage = "practice" | "projects" | "portfolio";

const Onboarding = () => {
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [personaData, setPersonaData] = useState<PersonaData | null>(null);
  const [usageGoal, setUsageGoal] = useState<MostUsage | null>(null);

  const isIndividual = userType === "student" || userType === "designer";

  const data = {
    userType,
    personaData,
    usageGoal,
  };

  const onSubmit = () => {
    console.log(data);
  };

  const disableButton =
    onboardingStep === 1
      ? !userType
      : onboardingStep === 2
        ? !personaData
        : !usageGoal;

  return (
    <Card className="w-full flex flex-col gap-5 items-center max-w-2xl px-5 z-10">
      <div className="flex justify-between items-center w-full">
        <div className="flex gap-3 items-center">
          <PacsazLogo scale={1.1} />
          <h1 className="font-semibold text-xl">به پک ساز خوش آمدید!</h1>
        </div>
        <Button
          variant={disableButton ? "outline" : "default"}
          disabled={disableButton}
          onClick={() =>
            setOnboardingStep((p) => {
              if (p === 3) {
                onSubmit();
                return p;
              }

              return p + 1;
            })
          }
        >
          ادامه
        </Button>
      </div>

      <Separator />
      {onboardingStep === 1 && (
        <Step1 userType={userType} setUserType={setUserType} />
      )}
      {onboardingStep === 2 && (
        <Step2 isIndividual={isIndividual} setPersonaData={setPersonaData} />
      )}
      {onboardingStep === 3 && <Step3 setUsageGoal={setUsageGoal} />}
    </Card>
  );
};

export default Onboarding;
