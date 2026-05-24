"use client";

import { authenticator } from "@/actions/login/authenticator";
import { verifyOtp } from "@/actions/login/otp";
import { handleRes } from "@/lib/handleRes";
import { otpFormSchema, OTPFormType } from "@/lib/validatoinSchema";
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
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoginStep } from "./LoginForm";

interface Props {
  setLoginStep: (val: LoginStep) => void;
  phoneNumber: string;
}

export function OTPForm({ setLoginStep, phoneNumber }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const form = useForm<OTPFormType>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async ({ otp }: OTPFormType) => {
    const otpRes = await verifyOtp(phoneNumber, otp);

    if (otpRes.error) {
      toast.error(otpRes.error);
      form.setValue("otp", "");
      return;
    }

    if (otpRes.success) {
      const authRes = await authenticator(phoneNumber);
      handleRes(authRes, {
        onSuccess: () => router.push(callbackUrl ?? "/panel"),
      });
    }
  };

  const otpValue = form.watch("otp");
  useEffect(() => {
    const autoSubmit = () => {
      if (otpValue.length === 5) {
        onSubmit({ otp: otpValue });
      }
    };

    autoSubmit();
  }, [otpValue]);

  return (
    <div className="space-y-5">
      <Form {...form}>
        <form className="space-y-5">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="space-y-2">
                    <p className="text-center text-sm text-muted-foreground">
                      لطفا کد ارسال شده به {phoneNumber} را وارد کنید.
                    </p>
                    <InputOTP autoFocus maxLength={5} {...field}>
                      <InputOTPGroup
                        dir="ltr"
                        autoFocus
                        className="w-full font-medium flex justify-center"
                      >
                        <InputOTPSlot index={0} className="w-12 h-12 text-md" />
                        <InputOTPSlot index={1} className="w-12 h-12 text-md" />
                        <InputOTPSlot index={2} className="w-12 h-12 text-md" />
                        <InputOTPSlot index={3} className="w-12 h-12 text-md" />
                        <InputOTPSlot index={4} className="w-12 h-12 text-md" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>

      <div className="space-y-3">
        <Button
          onClick={() => setLoginStep("input")}
          variant={"secondary"}
          size={"lg"}
          className="w-full"
        >
          بازگشت
        </Button>
      </div>
    </div>
  );
}
