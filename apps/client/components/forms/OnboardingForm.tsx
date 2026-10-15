"use client";

import { updateUserDataFromOnboardingForm } from "@/actions/user";
import {
  OnboardingFormType,
  onboardingFormSchema,
} from "@/lib/validatoinSchema";
import { isUserIndividual } from "@/utils/isUserIndividual";
import { handleRes } from "@/lib/handleRes";
import PacsazLogo from "@/components/PacsazLogo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoading } from "@repo/lib/utils/useLoading";
import { Button } from "@repo/ui/components/button";
import { Form } from "@repo/ui/components/form";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  ScrollText,
  Target,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Step1 from "../onboarding/Step1";
import Step2 from "../onboarding/Step2";
import Step3 from "../onboarding/Step3";
import Step4 from "../onboarding/Step4";

const STEPS = [
  { id: 1, label: "نوع کاربری", icon: UserRound },
  { id: 2, label: "مشخصات", icon: ClipboardList },
  { id: 3, label: "هدف استفاده", icon: Target },
  { id: 4, label: "قوانین", icon: ScrollText },
] as const;

/** Fields that must be valid before leaving each step. */
const STEP_FIELDS: Record<number, (keyof OnboardingFormType)[]> = {
  1: ["userType"],
  2: ["firstName", "email"],
  3: ["usageGoal"],
  4: [],
};

const OnboardingForm = ({ phoneNumber }: { phoneNumber: string }) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const { startLoading, stopLoading, isLoading } = useLoading();

  const form = useForm<OnboardingFormType>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      phoneNumber,
      email: "",
      firstName: "",
      lastName: "",
    },
    mode: "onTouched",
  });

  const userType = form.watch("userType");
  const email = form.watch("email");
  const firstName = form.watch("firstName");
  const usageGoal = form.watch("usageGoal");

  /**
   * Organisations fill a single "team name" field, so `lastName` is cleared
   * before validation — otherwise the resolver's optional-but-min(2) rule
   * rejects "" and the user gets stuck on the last step with no visible error.
   */
  const isIndividual = userType ? isUserIndividual(userType) : true;

  const currentStep = STEPS.find((s) => s.id === step) ?? STEPS[0];
  const progress = (step / STEPS.length) * 100;
  const isLast = step === STEPS.length;

  const isStepAnswered =
    step === 1
      ? Boolean(userType)
      : step === 2
        ? Boolean(firstName) && Boolean(email)
        : step === 3
          ? Boolean(usageGoal)
          : true;

  const onSubmit = async () => {
    const valid = await form.trigger();
    if (!valid) return;

    startLoading();
    const res = await updateUserDataFromOnboardingForm(form.getValues());
    handleRes(res, { onSuccess: () => router.push("/panel") });
    stopLoading();
  };

  const goNext = async () => {
    /**
     * `lastName` is `min(2).optional()`, so an empty string fails validation and
     * would strand organisation users on the final step with no visible field to
     * fix. An absent value is what the schema accepts, so drop it and clear any
     * error left over from when the field was still mounted.
     */
    if (!isIndividual) {
      form.setValue("lastName", undefined);
      form.clearErrors("lastName");
    }

    const valid = await form.trigger(STEP_FIELDS[step]);
    if (!valid) return;

    if (isLast) await onSubmit();
    else setStep((prev) => prev + 1);
  };

  const goBack = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="relative z-10 w-full max-w-2xl">
      <div className="overflow-hidden rounded-3xl border bg-background shadow-2xl shadow-primary/10">
        {/* ------------------------------ header ----------------------------- */}
        <div className="relative overflow-hidden border-b bg-gradient-to-bl from-primary/[0.09] via-background to-background px-6 pb-6 pt-5 md:px-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -top-24 size-56 rounded-full bg-primary/15 blur-3xl"
          />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <PacsazLogo />
              <div>
                <h1 className="text-sm font-extrabold tracking-tight md:text-base">
                  به پک‌ساز خوش آمدید
                </h1>
                <p className="text-[11px] text-muted-foreground">
                  در چند قدم کوتاه حساب خود را کامل کن
                </p>
              </div>
            </div>

            <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
              {step.toLocaleString("fa-IR", { useGrouping: false })} از{" "}
              {STEPS.length.toLocaleString("fa-IR", { useGrouping: false })}
            </span>
          </div>

          {/* progress bar */}
          <div className="relative mt-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <span
              style={{ width: `${progress}%` }}
              className="block h-full rounded-full bg-gradient-to-l from-violet-500 to-purple-600 transition-all duration-500"
            />
          </div>

          {/* step rail */}
          <ol className="relative mt-5 hidden items-center gap-2 sm:flex">
            {STEPS.map((s, index) => {
              const done = s.id < step;
              const active = s.id === step;
              const Icon = s.icon;

              return (
                <li key={s.id} className="flex flex-1 items-center gap-2">
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-xl text-[11px] font-bold transition-all duration-300",
                      active
                        ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-primary/25"
                        : done
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {done ? (
                      <Check className="size-3.5" strokeWidth={3} />
                    ) : (
                      <Icon className="size-3.5" strokeWidth={2} />
                    )}
                  </span>

                  <span
                    className={cn(
                      "truncate text-[11px] font-medium transition-colors",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </span>

                  {index < STEPS.length - 1 && (
                    <span
                      aria-hidden
                      className={cn(
                        "h-px flex-1 rounded-full transition-colors",
                        done ? "bg-primary/40" : "bg-border",
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* ------------------------------- body ------------------------------- */}
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void goNext();
            }}
            className="space-y-6 p-6 md:p-8"
          >
            <div key={currentStep.id} className="min-h-64">
              {step === 1 && <Step1 form={form} />}
              {step === 2 && <Step2 isIndividual={isIndividual} form={form} />}
              {step === 3 && <Step3 form={form} />}
              {step === 4 && <Step4 />}
            </div>

            {/* ----------------------------- actions ---------------------------- */}
            <div className="flex items-center gap-3 border-t pt-6">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={goBack}
                  disabled={isLoading}
                  className="shrink-0"
                >
                  <ArrowRight className="size-4" />
                  مرحله قبل
                </Button>
              )}

              <Button
                type="submit"
                size="lg"
                variant={isLast ? "gradient" : "default"}
                disabled={isLoading || !isStepAnswered}
                className="group flex-1"
              >
                {isLoading
                  ? "در حال ثبت..."
                  : isLast
                    ? "پذیرش قوانین و تکمیل ثبت‌نام"
                    : "مرحله بعد"}
                {!isLoading && (
                  <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        اطلاعات شما فقط برای شخصی‌سازی تجربه‌ی پک‌ساز استفاده می‌شود.
      </p>
    </div>
  );
};

export default OnboardingForm;
