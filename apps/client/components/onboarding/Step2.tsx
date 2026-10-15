import { OnboardingFormType } from "@/lib/validatoinSchema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Mail, UserRound } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

const Step2 = ({
  isIndividual,
  form,
}: {
  isIndividual: boolean;
  form: UseFormReturn<OnboardingFormType, any, OnboardingFormType>;
}) => {
  const stripNumbers = (value: string) =>
    value.replace(/[^a-zA-Zآ-ی\s]/g, "");

  return (
    <div className="space-y-5">
      <header className="space-y-1.5 text-center">
        <h2 className="text-lg font-extrabold tracking-tight">
          {isIndividual ? "خودت را معرفی کن" : "مجموعه‌ات را معرفی کن"}
        </h2>
        <p className="text-xs text-muted-foreground">
          {isIndividual
            ? "این نام روی حساب کاربری و فایل‌های خروجی نمایش داده می‌شود."
            : "نام تیم یا سازمان برای صدور مجوز استفاده تجاری ثبت می‌شود."}
        </p>
      </header>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-xs">
                {isIndividual ? "نام" : "نام سازمان/تیم"}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...field}
                    placeholder={isIndividual ? "مثلاً علیرضا" : "مثلاً استودیو آلفا"}
                    className="pr-9"
                    onChange={(e) => field.onChange(stripNumbers(e.target.value))}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        {isIndividual && (
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs">نام خانوادگی</FormLabel>
                <FormControl>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...field}
                      placeholder="مثلاً ازگینی"
                      className="pr-9"
                      onChange={(e) =>
                        field.onChange(stripNumbers(e.target.value))
                      }
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-xs">ایمیل</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...field}
                    type="email"
                    dir="ltr"
                    placeholder="name@example.com"
                    className="pr-9 text-left"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between rounded-2xl border bg-muted/30 px-4 py-3">
          <span className="text-[11px] text-muted-foreground">شماره تماس</span>
          <span dir="ltr" className="text-xs font-bold">
            {form.getValues("phoneNumber")}
          </span>
        </div>

        <p className="text-[10px] leading-5 text-muted-foreground">
          شماره تماس از اطلاعات ورود شماست و در این مرحله قابل تغییر نیست. برای
          تغییر آن با پشتیبانی تماس بگیرید.
        </p>
      </div>
    </div>
  );
};

export default Step2;
