"use client";

import { updateUserProfile } from "@/actions/user";
import { handleRes } from "@/lib/handleRes";
import { profileFormSchema, ProfileFormType } from "@/lib/validatoinSchema";
import { isUserIndividual } from "@/utils/isUserIndividual";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, UserType } from "@repo/db";
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
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { userTypes } from "../onboarding/Step1";

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const form = useForm<ProfileFormType>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user.fullName,
      userType: user.userType!,
    },
  });

  const onSubmit = async (data: ProfileFormType) => {
    console.log(data);
    const res = await updateUserProfile(data, 1); //todo;

    handleRes(res, { onSuccess: () => router.refresh() });
  };

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
                      e.target.value.replace(/[^a-zA-Zآ-ی\s]/g, ""),
                    )
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-1">
          <Label>شماره تماس</Label>
          <Input disabled value={user?.phoneNumber} />
        </div>

        <div className="space-y-1">
          <Label>ایمیل</Label>
          <Input disabled value={user?.email} />
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
                    <SelectValue placeholder="نوع کاربری" />
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
