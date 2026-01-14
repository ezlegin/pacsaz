"use client";

import { UserType } from "@/data/user";
import { userFormSchema, UserFormType } from "@/lib/validatoinSchema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { useForm } from "react-hook-form";
import PageTitle from "../PageTitle";

export function UserForm() {
  const form = useForm<UserFormType>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      userType: "designer",
    },
  });

  function onSubmit(data: UserFormType) {
    console.log(data);
  }

  return (
    <Form {...form}>
      <PageTitle title="New User" />
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
          name="userType"
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

        <Button
          size={"lg"}
          disabled={!form.formState.isValid}
          className="w-full"
        >
          Create User
        </Button>
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
