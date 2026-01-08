"use client";

import { testUser } from "@/data/user";
import { profileFormSchema, ProfileFormSchema } from "@/lib/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { UserType } from "../onboarding/Onboarding";
import { userTypes } from "../onboarding/Step1";
import { isUserIndividual } from "@/utils/isUserIndividual";
import { useForm } from "react-hook-form";

export function ProfileForm() {
  const form = useForm<ProfileFormSchema>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: testUser.fullName,
      userType: testUser.userType,
    },
  });

  function onSubmit(data: ProfileFormSchema) {
    console.log(data);
  }

  const userType = form.watch("userType") as UserType;
  const isIndividual = isUserIndividual(userType);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                {isIndividual ? "نام و نام خانوادگی" : "نام سازمان/تیم"}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.replace(/[^a-zA-Zآ-ی\s]/g, "")
                    )
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-1">
          <Label>شماره تماس</Label>
          <Input disabled value={testUser.phone} />
        </div>

        <div className="space-y-1">
          <Label>ایمیل</Label>
          <Input disabled value={testUser.email} />
        </div>

        <FormField
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>{"نوع کاربری"}</FormLabel>
              <FormControl>
                <Select
                  dir="rtl"
                  {...field}
                  onValueChange={(e) => field.onChange(e as UserType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {userTypes.map((u, idx) => (
                      <SelectItem key={idx} value={u.key}>
                        {u.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                  <FormMessage />
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          size={"lg"}
          disabled={!form.formState.isValid || !form.formState.isDirty}
          className="w-full"
        >
          ذخیره
        </Button>
      </form>
    </Form>
  );
}
