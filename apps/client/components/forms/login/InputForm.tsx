import { sendOtpCode } from "@/actions/login/otp";
import { handleRes } from "@/lib/handleRes";
import { inputFormSchema, InputFormType } from "@/lib/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoading } from "@repo/lib/utils/useLoading";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { ArrowLeft, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { LoginStep } from "./LoginForm";

interface Props {
  setLoginStep: (val: LoginStep) => void;
  setPhoneNumber: (val: string) => void;
}

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

export function InputForm({ setLoginStep, setPhoneNumber }: Props) {
  const { startLoading, stopLoading, isLoading } = useLoading();

  const form = useForm<InputFormType>({
    resolver: zodResolver(inputFormSchema),
    defaultValues: { phoneNumber: "" },
    mode: "onTouched",
  });

  const value = form.watch("phoneNumber") ?? "";
  /**
   * The field collects the local form (`912…`). The schema normalises it to
   * `0912…` for the Otp table, Kavenegar and the auth provider. Strip leading
   * zeros as they are typed and clamp to 10 digits, so pasting `0912…` works.
   */
  const digits = value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 10);

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

  /** 912 745 2859 */
  const formatted = digits
    .replace(/^(\d{3})(\d{0,3})(\d{0,4})$/, (_m, a, b, c) =>
      [a, b, c].filter(Boolean).join(" "),
    )
    .trim();

  const isComplete = digits.length === 10;

  return (
    <div className="flex flex-1 flex-col">
      <header className="mb-6 space-y-1.5">
        <h1 className="text-xl font-extrabold tracking-tight">
          ورود یا ساخت حساب
        </h1>
        <p className="text-xs leading-6 text-muted-foreground">
          شماره موبایل خود را وارد کن؛ کد تایید را پیامک می‌کنیم. نیازی به نوشتن
          صفر ابتدای شماره نیست.
        </p>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col"
        >
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <label
                  htmlFor="phoneNumber"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  شماره موبایل
                </label>

                <FormControl>
                  <div className="relative">
                    {/* fixed country prefix */}
                    <span
                      dir="ltr"
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-xs font-bold text-muted-foreground"
                    >
                      +۹۸
                    </span>

                    <span
                      aria-hidden
                      className="absolute left-11 top-1/2 h-4 w-px -translate-y-1/2 bg-border"
                    />

                    <Phone className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="phoneNumber"
                      {...field}
                      value={formatted}
                      inputMode="numeric"
                      autoComplete="tel"
                      dir="ltr"
                      placeholder="912 745 2859"
                      className="h-12 pl-14 pr-10 text-left font-bold tracking-wider tabular-nums"
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            .replace(/\D/g, "")
                            .replace(/^0+/, "")
                            .slice(0, 10),
                        )
                      }
                      maxLength={12}
                    />
                  </div>
                </FormControl>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <FormMessage className="text-[11px]" />

                  {digits.length > 0 && (
                    <span
                      className={`shrink-0 text-[10px] ${
                        isComplete ? "text-green-600" : "text-muted-foreground"
                      }`}
                    >
                      {fa(digits.length)} / ۱۰
                    </span>
                  )}
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="lg"
            variant="gradient"
            disabled={!form.formState.isValid || isLoading}
            className="group mt-5 w-full"
          >
            {isLoading ? (
              <>
                <Spinner />
                در حال ارسال کد...
              </>
            ) : (
              <>
                ارسال کد تایید
                <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
              </>
            )}
          </Button>

          <p className="mt-auto pt-6 text-center text-[10px] leading-5 text-muted-foreground">
            اگر حساب نداشته باشی، در همین مرحله ساخته می‌شود.
          </p>
        </form>
      </Form>
    </div>
  );
}
