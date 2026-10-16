"use client";

import { authenticator } from "@/actions/login/authenticator";
import { sendOtpCode, verifyOtp } from "@/actions/login/otp";
import { handleRes } from "@/lib/handleRes";
import { otpFormSchema, OTPFormType } from "@/lib/validatoinSchema";
import { useLoading } from "@repo/lib/utils/useLoading";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@repo/ui/components/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@repo/ui/components/input-otp";
import { Spinner } from "@repo/ui/components/spinner";
import { cn } from "@repo/ui/lib/utils";
import { ArrowRight, MessageSquareText, RotateCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoginStep } from "./LoginForm";

interface Props {
  setLoginStep: (val: LoginStep) => void;
  phoneNumber: string;
}

const RESEND_SECONDS = 60;

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

/** `09127452859` -> `0912 745 2859` for display only. */
const formatPhone = (phone: string) =>
  phone.replace(/^(\d{4})(\d{3})(\d{4})$/, "$1 $2 $3");

export function OTPForm({ setLoginStep, phoneNumber }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const { startLoading, stopLoading, isLoading } = useLoading();
  const {
    startLoading: startResending,
    stopLoading: stopResending,
    isLoading: isResending,
  } = useLoading();

  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const form = useForm<OTPFormType>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { otp: "" },
  });

  const otpValue = form.watch("otp");

  /* ---------------------------- resend countdown --------------------------- */
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  /* ------------------------------- auto submit ---------------------------- */
  useEffect(() => {
    if (otpValue.length === 5) {
      void onSubmit({ otp: otpValue });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpValue]);

  const onSubmit = async ({ otp }: OTPFormType) => {
    startLoading();

    const otpRes = await verifyOtp(phoneNumber, otp);

    if (otpRes.error) {
      toast.error(otpRes.error);
      form.setValue("otp", "");
      stopLoading();
      return;
    }

    if (otpRes.success) {
      const authRes = await authenticator(phoneNumber);
      handleRes(authRes, {
        onSuccess: () => router.push(callbackUrl ?? "/panel"),
      });
    }

    stopLoading();
  };

  const onResend = async () => {
    startResending();
    const res = await sendOtpCode({ phoneNumber });
    handleRes(res, { onSuccess: () => setSecondsLeft(RESEND_SECONDS) });
    stopResending();
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="mb-6 space-y-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
          <MessageSquareText className="size-3" />
          کد پیامک شد
        </span>

        <h1 className="text-xl font-extrabold tracking-tight">
          کد تایید را وارد کن
        </h1>
        <p className="text-xs leading-6 text-muted-foreground">
          کد ۵ رقمی ارسال‌شده به{" "}
          <span dir="ltr" className="font-bold text-foreground">
            {formatPhone(phoneNumber)}
          </span>{" "}
          را وارد کن.
        </p>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col"
        >
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP
                    autoFocus
                    maxLength={5}
                    {...field}
                    disabled={isLoading}
                    containerClassName="justify-center"
                  >
                    <InputOTPGroup dir="ltr" className="gap-2">
                      {[0, 1, 2, 3, 4].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className={cn(
                            "size-12 rounded-xl border text-base font-extrabold tabular-nums transition-all duration-200",
                            "data-[active=true]:border-primary data-[active=true]:ring-2 data-[active=true]:ring-primary/25",
                          )}
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
              </FormItem>
            )}
          />

          {/* progress + resend */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-center gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    i < otpValue.length
                      ? "w-6 bg-gradient-to-l from-violet-500 to-purple-600"
                      : "w-3 bg-muted",
                  )}
                />
              ))}
            </div>

            {isLoading ? (
              <p className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                <Spinner className="text-primary" />
                در حال بررسی کد...
              </p>
            ) : (
              <p className="text-center text-[11px] text-muted-foreground">
                {secondsLeft > 0 ? (
                  <>
                    ارسال مجدد کد تا {fa(secondsLeft)} ثانیه دیگر
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={onResend}
                    disabled={isResending}
                    className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline disabled:opacity-60"
                  >
                    {isResending ? (
                      <Spinner className="size-3" />
                    ) : (
                      <RotateCw className="size-3" />
                    )}
                    ارسال مجدد کد
                  </button>
                )}
              </p>
            )}
          </div>

          <div className="mt-auto space-y-2 pt-6">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setLoginStep("input")}
              disabled={isLoading}
              className="group w-full"
            >
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              ویرایش شماره تماس
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
