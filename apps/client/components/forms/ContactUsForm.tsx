"use client";

import { submitContactMessage } from "@/actions/contact";
import { contactFormSchema, ContactFormType } from "@/lib/validatoinSchema";
import { handleRes } from "@/lib/handleRes";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@repo/db";
import { useLoading } from "@repo/lib/utils/useLoading";
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
import { Textarea } from "@repo/ui/components/textarea";
import { cn } from "@repo/ui/lib/utils";
import {
  CheckCircle2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

const SUBJECTS = [
  "پیشنهاد و انتقاد",
  "مشکل فنی",
  "سؤال درباره اشتراک",
  "همکاری تجاری",
  "سایر",
];

export default function ContactUsForm({ user }: { user: User | null }) {
  const [sent, setSent] = useState(false);
  const { isLoading, startLoading, stopLoading } = useLoading();

  const form = useForm<ContactFormType>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      email: user?.email ?? "",
      fullName: user?.fullName ?? "",
      phone: user?.phoneNumber ?? "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormType) => {
    startLoading();
    const res = await submitContactMessage(data);

    handleRes(res, {
      onSuccess: () => {
        setSent(true);
        form.reset({
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          subject: "",
          message: "",
        });
      },
    });

    stopLoading();
  };

  /* ------------------------------ success ------------------------------ */
  if (sent) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 rounded-3xl border border-green-500/25 bg-green-500/[0.04] px-6 py-16 text-center">
        <span className="grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-lg shadow-green-500/25">
          <CheckCircle2 className="size-7" strokeWidth={1.9} />
        </span>

        <div className="space-y-1.5">
          <h3 className="text-base font-extrabold">پیام شما ارسال شد</h3>
          <p className="max-w-sm text-xs leading-6 text-muted-foreground">
            در اولین فرصت از طریق ایمیل پاسخ می‌دهیم. اگر پیام فوری داری،
            می‌توانی با شماره پشتیبانی تماس بگیری.
          </p>
        </div>

        <Button variant="outline" onClick={() => setSent(false)}>
          ارسال پیام دیگر
        </Button>
      </div>
    );
  }

  /* -------------------------------- form -------------------------------- */
  return (
    <div className="rounded-3xl border bg-background p-6 md:p-8">
      <header className="mb-6 space-y-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
          <MessageSquare className="size-3" />
          فرم تماس
        </span>
        <h2 className="text-lg font-extrabold tracking-tight">
          پیامت را برای ما بنویس
        </h2>
        <p className="text-xs leading-6 text-muted-foreground">
          معمولاً در بازه‌ی ساعت‌های پاسخ‌گویی، در کمتر از یک روز کاری جواب
          می‌دهیم.
        </p>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">نام و نام خانوادگی</FormLabel>
                <FormControl>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...field}
                      placeholder="نام شما"
                      className="pr-9"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">ایمیل</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...field}
                      type="email"
                      dir="ltr"
                      placeholder="name@example.com"
                      className="pr-9 text-left"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">
                  شماره تماس{" "}
                  <span className="font-normal text-muted-foreground">
                    (اختیاری)
                  </span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...field}
                      dir="ltr"
                      placeholder="09xxxxxxxxx"
                      className="pr-9 text-left"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">عنوان</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="موضوع پیام" />
                </FormControl>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {SUBJECTS.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() =>
                        form.setValue("subject", subject, {
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[10px] transition-colors",
                        field.value === subject
                          ? "border-primary bg-primary/10 text-primary"
                          : "bg-background text-muted-foreground hover:border-primary/30 hover:text-primary",
                      )}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs">پیام</FormLabel>
                  <span className="text-[10px] text-muted-foreground">
                    {field.value.length.toLocaleString("fa-IR", {
                      useGrouping: false,
                    })}{" "}
                    / ۲۰۰۰
                  </span>
                </div>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="موضوع را کامل توضیح بده؛ اگر درباره‌ی یک قالب خاص است، نام یا لینک آن را هم بنویس."
                    className="min-h-40"
                  />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] leading-5 text-muted-foreground">
              با ارسال این فرم، با{" "}
              <a
                href="/terms"
                className="font-medium text-primary hover:underline"
              >
                قوانین و مقررات
              </a>{" "}
              پک‌ساز موافقت می‌کنی.
            </p>

            <Button
              type="submit"
              size="lg"
              variant="gradient"
              disabled={isLoading}
              className="group shrink-0"
            >
              {isLoading ? "در حال ارسال..." : "ارسال پیام"}
              {!isLoading && (
                <Send className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
