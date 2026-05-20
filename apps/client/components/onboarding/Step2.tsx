import {
  onboardingStep2Schema,
  OnboardingStep2Type,
} from "@/lib/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PersonaData } from "./Onboarding";

const Step2 = ({
  isIndividual,
  setPersonaData,
}: {
  isIndividual: boolean;
  setPersonaData: (val: PersonaData) => void;
}) => {
  const form = useForm<OnboardingStep2Type>({
    resolver: zodResolver(onboardingStep2Schema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: isIndividual ? "" : undefined,
    },
    mode: "onChange",
  });

  const email = form.watch("email");
  const firstName = form.watch("firstName");
  const lastName = form.watch("lastName");
  const isValid = form.formState.isValid;

  useEffect(() => {
    if (isValid) {
      setPersonaData({ email, firstName, lastName });
    }
  }, [email, firstName, lastName, isValid]);

  return (
    <Form {...form}>
      <form className="space-y-4 w-full">
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
      </form>
    </Form>
  );
};

export default Step2;
