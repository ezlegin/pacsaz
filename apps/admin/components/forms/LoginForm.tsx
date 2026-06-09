"use client";

import { verifyLogin } from "@/actions/login/login";
import {
  inputFormSchema,
  InputFormType,
} from "@/lib/validationSchema/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleRes } from "@repo/lib/utils/handleRes";
import { useLoading } from "@repo/lib/utils/useLoading";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";

export function LoginForm() {
  const { startLoading, stopLoading, isLoading } = useLoading();
  const form = useForm<InputFormType>({
    resolver: zodResolver(inputFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: InputFormType) => {
    startLoading();

    const res = await verifyLogin(data.email, data.password);

    handleRes(res);

    stopLoading();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    placeholder="email@example.com"
                    className="pl-10"
                  />
                  <Mail
                    size={18}
                    className="text-muted-foreground absolute top-1/2 -translate-y-1/2 left-3"
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    placeholder="password"
                    className="pl-10"
                    type="password"
                  />
                  <Lock
                    size={18}
                    className="text-muted-foreground absolute top-1/2 -translate-y-1/2 left-3"
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          size={"lg"}
          disabled={!form.formState.isValid || isLoading}
          className="w-full"
        >
          <Spinner isLoading={isLoading} />
          Log In
        </Button>
      </form>
    </Form>
  );
}
