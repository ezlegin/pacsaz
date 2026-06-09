"use client";

import { createUser, updateUser } from "@/actions/user";
import {
  adminFormSchema,
  AdminFormType,
} from "@/lib/validationSchema/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Admin } from "@repo/db";
import { UserType } from "@repo/lib/data/types";
import { handleRes } from "@repo/lib/utils/handleRes";
import { useLoading } from "@repo/lib/utils/useLoading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import SubmitButton from "../SubmitButton";

export function AdminForm({ admin }: { admin?: Admin }) {
  const router = useRouter();
  const { startLoading, stopLoading, isLoading } = useLoading();
  const form = useForm<AdminFormType>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      fullName: admin?.fullName ?? "",
      email: admin?.email ?? "",
      phoneNumber: admin?.phoneNumber ?? "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminFormType) => {
    startLoading();

    const res = admin
      ? await updateUser(data, admin.id)
      : await createUser(data);

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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <SubmitButton
          form={form}
          isLoading={isLoading}
          label={admin ? "Update" : "Create"}
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
