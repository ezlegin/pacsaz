"use client";

import PageTitle from "@/components/PageTitle";
import { contactFormSchema, ContactFormType } from "@/lib/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { useForm } from "@workspace/ui/index";

export default function ContactUs() {
  const form = useForm<ContactFormType>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      email: "",
      fullName: "",
      message: "",
      phone: "",
      subject: "",
    },
  });

  const onSubmit = (data: ContactFormType) => {
    console.log(data);
  };

  return (
    <div className="mx-auto max-w-7xl pt-5">
      <div className="w-full flex flex-col items-center justify-center gap-8">
        <div className="flex flex-col text-center">
          <PageTitle
            title="تماس با ما"
            subTitle="برای ارتباط با پک ساز، فرم مقابل را تکمیل نمایید. کارشناسان ما در
            کوتاه‌ترین زمان با شما تماس خواهند گرفت."
          />

          <div className="pt-2">
            <p className="font-medium">ایمیل پک ساز</p>
            <p className="text-primary">pacsaz.ir@gmail.com</p>
          </div>
        </div>

        <div className="w-full max-w-2xl mx-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right"
            >
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام و نام خانوادگی</FormLabel>
                    <FormControl>
                      <Input placeholder="نام و نام خانوادگی" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ایمیل</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شماره تماس</FormLabel>
                    <FormControl>
                      <Input placeholder="09xxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان</FormLabel>
                    <FormControl>
                      <Input placeholder="عنوان پیام" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>پیام</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="پیام خود را بنویسید..."
                        {...field}
                        className="min-h-[200px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 flex justify-end pt-2">
                <Button type="submit">ارسال پیام</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
