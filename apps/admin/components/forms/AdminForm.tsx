"use client";

import { createAdmin, updateAdmin } from "@/actions/admin";
import {
  adminFormSchema,
  AdminFormType,
} from "@/lib/validationSchema/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Admin } from "@repo/db";

/** An admin as the panel may show it: never with the password hash. */
export type AdminRow = Omit<Admin, "password">;
import { handleRes } from "@repo/lib/utils/handleRes";
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
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import SubmitButton from "../SubmitButton";

export function AdminForm({ admin }: { admin?: AdminRow }) {
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
      ? await updateAdmin(data, admin.id)
      : await createAdmin(data);

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
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder={admin ? "Leave empty to keep the current one" : "At least 6 characters"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
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
