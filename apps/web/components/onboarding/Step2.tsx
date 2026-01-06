import { PersonaData } from "@/app/login/onboarding/page";
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
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

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
      fullName: "",
    },
  });

  const email = form.watch("email");
  const fullName = form.watch("fullName");
  const isValid = form.formState.isValid;

  useEffect(() => {
    if (isValid) {
      setPersonaData({ email, fullName });
    }
  }, [email, fullName, isValid]);

  return (
    <Form {...form}>
      <form className="flex gap-10 w-full">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                {isIndividual ? "نام و نام خانوادگی" : "نام سازمان/تیم"}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value.replace(/[^a-zA-Zآ-ی\s]/g, "")
                      )
                    }
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />

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
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default Step2;
