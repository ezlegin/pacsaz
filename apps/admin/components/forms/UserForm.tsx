"use client";

import { createUser, updateUser } from "@/actions/user";
import {
  userFormSchema,
  UserFormType,
} from "@/lib/validationSchema/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@repo/db";
import { UserType } from "@repo/lib/data/types";
import { useLoading } from "@repo/lib/utils/useLoading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import SubmitButton from "../SubmitButton";
import { handleRes } from "@repo/lib/utils/handleRes";

export function UserForm({ user }: { user?: User }) {
  const router = useRouter();
  const { startLoading, stopLoading, isLoading } = useLoading();
  const form = useForm<UserFormType>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      type: user?.userType ?? "designer",
    },
  });

  const onSubmit = async (data: UserFormType) => {
    startLoading();

    const res = user ? await updateUser(data, user.id) : await createUser(data);

    handleRes(res, { onSuccess: () => router.refresh() });

    stopLoading();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Type</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {userTypes.map((i, idx) => (
                      <SelectItem key={idx} value={i.key}>
                        {i.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton
          form={form}
          isLoading={isLoading}
          label={user ? "Update" : "Create"}
        />
      </form>
    </Form>
  );
}

const userTypes: {
  label: string;
  key: UserType;
}[] = [
  { label: "Designer", key: "designer" },
  { label: "Design Studio", key: "designStudio" },
  { label: "Student", key: "student" },
  { label: "Print House", key: "printHouse" },
  { label: "Dieline Maker", key: "dielineMaker" },
  { label: "Packaging Factory", key: "packagingFactory" },
  { label: "Other", key: "other" },
];
