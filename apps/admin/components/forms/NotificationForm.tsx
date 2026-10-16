"use client";

import { saveNotification } from "@/actions/notification";
import {
  NotificationFormType,
  notificationFormSchema,
} from "@/lib/validationSchema/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { NotificationBar } from "@repo/db";
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
import { Switch } from "@repo/ui/components/switch";
import { Textarea } from "@repo/ui/components/textarea";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import SubmitButton from "../SubmitButton";

/** `Date` → the value a `datetime-local` input expects, in the viewer's zone. */
function toLocalInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

const Hint = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs text-muted-foreground">{children}</p>
);

function NotificationForm({
  notification,
}: {
  notification?: NotificationBar | null;
}) {
  const router = useRouter();
  const { startLoading, stopLoading, isLoading } = useLoading();

  const form = useForm<NotificationFormType>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      text: notification?.text ?? "",
      ctaTitle: notification?.ctaTitle ?? "",
      ctaLink: notification?.ctaLink ?? "",
      expiresAt: "",
      active: notification?.active ?? true,
    },
  });

  /*
   * Filled after mount, not in `defaultValues`: the input needs the deadline in
   * the *browser's* timezone, while this component is also rendered on the server
   * whose timezone differs — setting it during the first render would hydrate the
   * input with a different value than the server sent.
   */
  useEffect(() => {
    if (notification?.expiresAt)
      form.setValue(
        "expiresAt",
        toLocalInputValue(new Date(notification.expiresAt)),
      );
  }, [notification?.expiresAt, form]);

  const onSubmit = async (data: NotificationFormType) => {
    startLoading();

    const res = await saveNotification({
      ...data,
      // Converted here because the action runs on the server, which cannot know
      // which timezone the admin typed the deadline in.
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : "",
    });

    handleRes(res, { onSuccess: () => router.refresh() });

    stopLoading();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="ctaTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CTA title</FormLabel>
                <FormControl>
                  <Input placeholder="Optional" {...field} />
                </FormControl>
                <Hint>Leave empty for a bar with no button.</Hint>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ctaLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CTA link</FormLabel>
                <FormControl>
                  <Input placeholder="/subscription" {...field} />
                </FormControl>
                <Hint>An internal path or a full URL.</Hint>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Countdown deadline</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <Hint>
                Leave empty for no timer. While set, visitors see a live
                day : hour : minute : second countdown, and the bar disappears
                once it passes.
              </Hint>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <Hint>Switch off to hide it on every page, in both apps.</Hint>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <SubmitButton form={form} isLoading={isLoading} label="Save" />
      </form>
    </Form>
  );
}

export default NotificationForm;
