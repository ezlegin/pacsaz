"use client";

import { otpFormSchema, OTPFormType } from "@/lib/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { REGEXP_ONLY_DIGITS } from "@workspace/ui/index";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@workspace/ui/components/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";
import { useForm } from "@workspace/ui/index";
import { LoginStep } from "./LoginForm";
import { useEffect } from "react";

interface Props {
  setLoginStep: (val: LoginStep) => void;
}

export function OTPForm({ setLoginStep }: Props) {
  const form = useForm<OTPFormType>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: "",
    },
  });

  function onSubmit(values: OTPFormType) {
    console.log(values);
  }

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
                      لطفا کد ارسال شده به 09127452859 را وارد کنید.
                    </p>
                    <InputOTP
                      autoFocus
                      maxLength={5}
                      {...field}
                      pattern={REGEXP_ONLY_DIGITS}
                    >
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
