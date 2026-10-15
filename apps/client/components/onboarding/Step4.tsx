import { termsAndConditions, termsGroups } from "@/data/terms";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { cn } from "@repo/ui/lib/utils";
import { ArrowUpRight, ScrollText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Terms from "../Terms";

const Step4 = () => {
  const fa = (value: number) =>
    value.toLocaleString("fa-IR", { useGrouping: false });

  return (
    <div className="space-y-5">
      <header className="space-y-1.5 text-center">
        <h2 className="text-lg font-extrabold tracking-tight">
          قوانین و مقررات را بپذیر
        </h2>
        <p className="text-xs leading-6 text-muted-foreground">
          ثبت‌نام شما به‌منزله‌ی تایید کامل{" "}
          {fa(termsAndConditions.length)} بند قوانین پک‌ساز است. لطفاً پیش از
          تایید، حداقل بخش‌های مربوط به مسئولیت کاربر را بخوانید.
        </p>
      </header>

      {/* acceptance summary */}
      <div className="space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-600">
            <ShieldCheck className="size-4" strokeWidth={1.9} />
          </span>
          <p className="text-xs font-bold">نکات کلیدی پیش از تایید</p>
        </div>

        <ul className="space-y-2 pr-1">
          {[
            "بررسی نهایی ابعاد، تلرانس، متریال و بلید بر عهده‌ی شماست.",
            "خروجی پک‌ساز جایگزین بررسی فنی چاپخانه یا قالب‌ساز نمی‌شود.",
            "دانلود قالب‌ها برای استفاده‌ی شخصی یا تجاری خودتان مجاز است.",
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-[11px] leading-6 text-muted-foreground"
            >
              <span className="mt-2 size-1 shrink-0 rounded-full bg-amber-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* quick section overview */}
      <div className="flex flex-wrap gap-1.5">
        {termsGroups.map((group) => (
          <span
            key={group.id}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-[10px] text-muted-foreground",
            )}
          >
            {group.title}
            <span className="rounded-md bg-muted px-1 font-bold tabular-nums">
              {fa(group.items.length)}
            </span>
          </span>
        ))}
      </div>

      {/* full text */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[11px] font-bold">
            <ScrollText className="size-3.5 text-primary" />
            متن کامل قوانین
          </span>
          <Link
            href="/terms"
            target="_blank"
            className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
          >
            مطالعه در صفحه‌ی جداگانه
            <ArrowUpRight className="size-3" />
          </Link>
        </div>

        <ScrollArea
          scrollHideDelay={9999}
          dir="rtl"
          className="h-72 w-full rounded-2xl border bg-muted/20 p-4"
        >
          <div className="pl-3 text-muted-foreground">
            <Terms style="raw" />
          </div>
        </ScrollArea>
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        با زدن دکمه‌ی زیر، تایید می‌کنی که قوانین و مقررات را خوانده و پذیرفته‌ای.
      </p>
    </div>
  );
};

export default Step4;
