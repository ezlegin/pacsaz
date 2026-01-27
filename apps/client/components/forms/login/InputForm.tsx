"use client";

import { inputFormSchema, InputFormType } from "@/lib/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Phone } from "lucide-react";
import { LoginStep } from "./LoginForm";
import { useForm } from "react-hook-form";

interface Props {
  setLoginStep: (val: LoginStep) => void;
  setPhoneNumber: (val: string) => void;
}

export function InputForm({ setLoginStep, setPhoneNumber }: Props) {
  const form = useForm<InputFormType>({
    resolver: zodResolver(inputFormSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  function onSubmit(data: InputFormType) {
    setLoginStep("otp");
    setPhoneNumber(data.phoneNumber);
    console.log(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    placeholder="شماره تماس خود را وارد کنید..."
                    className="pr-10"
                    onChange={(e) =>
                      field.onChange(e.target.value.replace(/\D/g, ""))
                    }
                    maxLength={11}
                  />
                  <Phone
                    size={18}
                    className="text-muted-foreground absolute top-1/2 -translate-y-1/2 right-3"
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          size={"lg"}
          disabled={!form.formState.isValid}
          className="w-full"
        >
          ارسال کد
        </Button>
      </form>
    </Form>
  );
}
