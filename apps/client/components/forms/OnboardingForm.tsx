"use client";

import { updateUserDataFromOnboardingForm } from "@/actions/user";
import Step1 from "@/components/onboarding/Step1";
import Step2 from "@/components/onboarding/Step2";
import Step3 from "@/components/onboarding/Step3";
import { handleRes } from "@/lib/handleRes";
import {
  onboardingFormSchema,
  OnboardingFormType,
} from "@/lib/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoading } from "@repo/lib/utils/useLoading";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Form } from "@repo/ui/components/form";
import { Separator } from "@repo/ui/components/separator";
import { Spinner } from "@repo/ui/components/spinner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Step4 from "../onboarding/Step4";
import PacsazLogo from "../PacsazLogo";
import { useRouter } from "next/navigation";

const OnboardingForm = ({ phoneNumber }: { phoneNumber: string }) => {
  const router = useRouter();
  const form = useForm<OnboardingFormType>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      phoneNumber,
      email: "",
      firstName: "",
      lastName: "",
    },
    mode: "onChange",
  });

  const [onboardingStep, setOnboardingStep] = useState(1);
  const { startLoading, stopLoading, isLoading } = useLoading();

  const userType = form.watch("userType");
  const email = form.watch("email");
  const firstName = form.watch("firstName");
  const usageGoal = form.watch("usageGoal");
  const isIndividual = userType === "student" || userType === "designer";

  const onSubmit = async () => {
    const formData = form.getValues();

    startLoading();

    const res = await updateUserDataFromOnboardingForm(formData);
    handleRes(res, {
      onSuccess: () => {
        router.push("/panel");
      },
    });

    stopLoading();
  };

  const disableButton =
    onboardingStep === 1
      ? !userType
      : onboardingStep === 2
        ? !email || !firstName
        : !usageGoal;

  return (
    <Card className="w-full flex flex-col gap-4 items-center max-w-2xl px-5 z-10 pt-4">
      <div className="flex justify-between items-center w-full">
        <div className="flex gap-3 items-center">
          <PacsazLogo />
          <h1 className="font-semibold text-lg">به پک ساز خوش آمدید!</h1>
        </div>
        <div dir="ltr" className="text-xs text-muted-foreground font-medium">
          مرحله {onboardingStep} / 4
        </div>
      </div>

      <Separator className="mb-3" />

      <Form {...form}>
        <form className="space-y-5 w-full">
          {onboardingStep === 1 && <Step1 form={form} />}
          {onboardingStep === 2 && (
            <Step2 isIndividual={isIndividual} form={form} />
          )}
          {onboardingStep === 3 && <Step3 form={form} />}
          {onboardingStep === 4 && <Step4 />}

          <Button
            type="button"
            onClick={() => {
              if (onboardingStep < 4) setOnboardingStep((pre) => pre + 1);
              else onSubmit();
            }}
            disabled={isLoading || disableButton}
            size={"lg"}
            className="w-full"
          >
            <Spinner isLoading={isLoading} />
            {onboardingStep < 4 ? "مرحله بعد" : "پذیرش قوانین و ثبت نام"}
          </Button>
        </form>
      </Form>
    </Card>
  );
  // return (
  //   <Card className="w-full flex flex-col gap-4 items-center max-w-2xl px-5 z-10 pt-4">
  //     <div className="flex justify-between items-center w-full">
  //       <div className="flex gap-3 items-center">
  //         <PacsazLogo />
  //         <h1 className="font-semibold text-lg">به پک ساز خوش آمدید!</h1>
  //       </div>
  //       <div className="flex items-center gap-3">
  //         <div dir="ltr" className="text-xs text-muted-foreground font-medium">
  //           {onboardingStep} / 4
  //         </div>
  //         <Button
  //           variant={disableButton ? "outline" : "default"}
  //           disabled={disableButton || isLoading}
  //           onClick={() =>
  //             setOnboardingStep((p) => {
  //               if (p === 4) {
  //                 onSubmit();
  //                 return p;
  //               }

  //               return p + 1;
  //             })
  //           }
  //         >
  //           {onboardingStep === 4 ? "پذیرش و ثبت نام" : "ادامه"}
  //         </Button>
  //       </div>
  //     </div>

  //     <Separator className="mb-3" />

  //     {onboardingStep === 1 && (
  //       <Step1 userType={onboardingData.userType} setUserType={setUserType} />
  //     )}
  //     {onboardingStep === 2 && (
  //       <Step2 isIndividual={isIndividual} setPersonaData={setPersonalData} />
  //     )}
  //     {onboardingStep === 3 && <Step3 setUsageGoal={setUsageGoal} />}

  //     {onboardingStep === 4 && <Step4 />}
  //   </Card>
  // );
};

export default OnboardingForm;
