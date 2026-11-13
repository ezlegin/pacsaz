import { privacy, terms } from "@/data/legal";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { ArrowUpRight, ScrollText, ShieldCheck } from "lucide-react";
import Link from "next/link";

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
          ثبت‌نام شما به‌منزله‌ی پذیرش {fa(terms.sections.length)} ماده‌ی قوانین
          پک‌ساز و سیاست حریم خصوصی است. لطفاً پیش از تایید، حداقل بخش‌های مربوط به مسئولیت
          کاربر را بخوانید.
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
            {[terms, privacy].map((doc) => (
              <div key={doc.title} className="space-y-4 pb-6">
                <p className="text-sm font-bold text-foreground">{doc.title}</p>
                {doc.sections.map((section, index) => (
                  <div key={section.id} className="space-y-1.5">
                    <p className="text-xs font-bold text-foreground">
                      ماده {fa(index + 1)}. {section.title}
                    </p>
                    {section.clauses.map((clause, clauseIndex) => (
                      <p key={clauseIndex} className="text-xs leading-6">
                        {fa(index + 1)}.{fa(clauseIndex + 1)} {clause}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        با زدن دکمه‌ی زیر، تایید می‌کنی که قوانین و مقررات را خوانده و
        پذیرفته‌ای.
      </p>
    </div>
  );
};

export default Step4;
