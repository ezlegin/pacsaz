import { OnboardingFormType } from "@/lib/validatoinSchema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { UseFormReturn } from "react-hook-form";

const Step2 = ({
  isIndividual,
  form,
}: {
  isIndividual: boolean;
  form: UseFormReturn<OnboardingFormType, any, OnboardingFormType>;
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>{isIndividual ? "نام" : "نام سازمان/تیم"}</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.replace(/[^a-zA-Zآ-ی\s]/g, ""),
                    )
                  }
                />
              </div>
            </FormControl>
          </FormItem>
        )}
      />

      {isIndividual && (
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>نام خانوادگی</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value.replace(/[^a-zA-Zآ-ی\s]/g, ""),
                      )
                    }
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>ایمیل</FormLabel>
            <FormControl>
              <div className="relative">
                <Input {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default Step2;
