import { alirezaEzleginiPic, packagingCoursePic } from "@/public";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowLeft,
  Award,
  Check,
  Clock,
  ExternalLink,
  GraduationCap,
  Headphones,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const COURSE_URL = "https://igraphical.ir/courses/packaging";

const HIGHLIGHTS = [
  "آموزش طراحی بسته‌بندی از صفر تا صد",
  "پروژه‌محور و بر پایه نمونه‌های واقعی چاپ",
  "پشتیبانی و رفع اشکال آنلاین",
  "مناسب طراحان، چاپخانه‌ها و تیم‌های تولید",
];

const STATS = [
  { icon: Clock, value: "۱۰.۵", label: "ساعت ویدیو" },
  { icon: GraduationCap, value: "۱۰", label: "فصل آموزشی" },
  { icon: Award, value: "مدرک", label: "پایان دوره" },
];

const HomeCourseIntro = () => {
  return (
    <section className="relative">
      <div className="relative overflow-hidden rounded-3xl border bg-background p-8 shadow-sm md:p-12">
        {/* brand wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          {/* ------------------------------ content ----------------------------- */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                <GraduationCap className="size-3.5" />
                دوره آموزشی پک‌ساز
              </span>

              <span className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-[11px] font-medium">
                <Star className="size-3.5 text-amber-500" fill="currentColor" />
                ۴.۹ از ۵
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                دوره جامع{" "}
                <span className="bg-gradient-to-l from-violet-500 to-purple-600 bg-clip-text text-transparent">
                  طراحی بسته‌بندی و لیبل
                </span>
              </h2>

              <p className="max-w-lg text-sm leading-6 text-muted-foreground">
                از ساخت دایلاین تا فایل نهایی چاپ؛ همه‌چیز را گام‌به‌گام و بر
                پایه پروژه‌های واقعی یاد بگیر و آماده ورود به بازار کار شو.
              </p>
            </div>

            <ul className="grid gap-2.5 sm:grid-cols-2">
              {HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"
                >
                  <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-2.5" strokeWidth={3.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* stats */}
            <div className="grid grid-cols-3 gap-3 border-y py-4">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold leading-tight">
                      {value}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* instructor + cta */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Image
                  alt="علیرضا ازگینی"
                  src={alirezaEzleginiPic}
                  width={48}
                  height={48}
                  className="size-12 rounded-full object-cover shadow-sm ring-2 ring-primary/15"
                />
                <div>
                  <p className="text-[11px] text-muted-foreground">مدرس دوره</p>
                  <p className="text-sm font-bold">علیرضا ازگینی</p>
                </div>
              </div>

              <Link href={COURSE_URL} target="_blank" className="sm:w-auto">
                <Button variant="gradient" size="lg" className="group w-full">
                  مشاهده دوره
                  <ExternalLink className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-[-2px]" />
                </Button>
              </Link>
            </div>
          </div>

          {/* ------------------------------- visual ----------------------------- */}
          <div className="relative hidden lg:block">
            <div
              aria-hidden
              className={cn(
                "absolute -inset-4 rounded-[2rem]",
                "bg-gradient-to-bl from-primary/20 via-primary/5 to-transparent blur-2xl",
              )}
            />

            <div className="relative overflow-hidden rounded-3xl border shadow-xl shadow-primary/10">
              <Image
                alt="دوره جامع طراحی بسته‌بندی و لیبل"
                src={packagingCoursePic}
                width={720}
                height={540}
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              />

              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
              />

              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-white">
                <div>
                  <p className="text-[11px] text-white/70">پیش‌نیاز</p>
                  <p className="text-sm font-bold">
                    آشنایی مقدماتی با نرم‌افزارهای طراحی
                  </p>
                </div>

                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium backdrop-blur">
                  <Headphones className="size-3.5" />
                  پشتیبانی آنلاین
                </span>
              </div>
            </div>

            <Link
              href={COURSE_URL}
              target="_blank"
              className="absolute -bottom-5 right-6 hidden items-center gap-2 rounded-2xl border bg-background px-4 py-2.5 text-xs font-medium shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary xl:flex"
            >
              جزئیات و ثبت‌نام
              <ArrowLeft className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCourseIntro;
