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
import { sendOtpCode } from "@/actions/login/otp";
import { handleRes } from "@/lib/handleRes";
import { useLoading } from "@repo/lib/utils/useLoading";
import { Spinner } from "@repo/ui/components/spinner";

interface Props {
  setLoginStep: (val: LoginStep) => void;
  setPhoneNumber: (val: string) => void;
}

export function InputForm({ setLoginStep, setPhoneNumber }: Props) {
  const { startLoading, stopLoading, isLoading } = useLoading();
  const form = useForm<InputFormType>({
    resolver: zodResolver(inputFormSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const onSubmit = async (data: InputFormType) => {
    startLoading();

    const res = await sendOtpCode(data);
    handleRes(res, {
      onSuccess: () => {
        setLoginStep("otp");
        setPhoneNumber(data.phoneNumber);
      },
    });

    stopLoading();
  };

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
          disabled={!form.formState.isValid || isLoading}
          className="w-full"
        >
          <Spinner isLoading={isLoading} />
          ارسال کد
        </Button>
      </form>
    </Form>
  );
}
