import Terms from "@/components/Terms";
import { termsAndConditions, termsGroups } from "@/data/terms";
import { BadgeCheck, FileText, Phone, Scale, ShieldAlert } from "lucide-react";
import Link from "next/link";

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

const page = () => {
  const lastUpdated = new Date().toLocaleDateString("fa-IR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* ------------------------------- header ------------------------------ */}
      <header className="relative overflow-hidden rounded-3xl border bg-gradient-to-bl from-primary/[0.08] via-background to-background p-6 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
              <Scale className="size-3.5" />
              آخرین به‌روزرسانی: {lastUpdated}
            </span>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                قوانین و{" "}
                <span className="bg-gradient-to-l from-violet-500 to-purple-600 bg-clip-text text-transparent">
                  مقررات
                </span>
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                استفاده از وب‌سایت پک‌ساز به‌منزله پذیرش کامل قوانین و مقررات
                حاضر است. در صورت عدم موافقت با هر یک از مفاد، لطفاً از ادامه
                استفاده از خدمات خودداری نمایید.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {[
              { value: fa(termsAndConditions.length), label: "بند" },
              { value: fa(termsGroups.length), label: "بخش" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="min-w-24 rounded-2xl border bg-background/70 p-4 text-center backdrop-blur"
              >
                <p className="text-2xl font-extrabold text-primary">
                  {stat.value}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ------------------------- acceptance notice ------------------------ */}
      <div className="flex flex-col gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-5 sm:flex-row sm:items-start">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-600">
          <ShieldAlert className="size-5" strokeWidth={1.9} />
        </span>
        <div className="space-y-1">
          <p className="text-xs font-bold">
            پیش از پرداخت یا دانلود، این صفحه را کامل بخوانید
          </p>
          <p className="text-[11px] leading-6 text-muted-foreground">
            مسئولیت بررسی نهایی ابعاد، تلرانس‌ها، متریال، بلید و سازگاری فایل با
            فرآیند چاپ بر عهده کاربر است. خروجی‌های پک‌ساز جایگزین بررسی فنی
            چاپخانه یا قالب‌ساز نمی‌شوند.
          </p>
        </div>
      </div>

      {/* -------------------------- body + contents ------------------------- */}
      <div className="flex gap-10">
        {/* table of contents */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-6 space-y-4 rounded-2xl border bg-background p-5">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-4" strokeWidth={1.9} />
              </span>
              <h2 className="text-xs font-bold">فهرست مطالب</h2>
            </div>

            <nav>
              <ul className="space-y-1">
                {termsGroups.map((group) => (
                  <li key={group.id}>
                    <a
                      href={`#${group.id}`}
                      className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <span className="h-1 w-1 rounded-full bg-primary/0 transition-colors group-hover:bg-primary" />
                      <span className="flex-1 truncate">{group.title}</span>
                      <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
                        {fa(group.items.length)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="space-y-2 border-t pt-4">
              <p className="text-[10px] text-muted-foreground">
                سؤالی درباره قوانین داری؟
              </p>
              <a
                href="mailto:pacsaz.ir@gmail.com"
                className="flex items-center gap-2 text-[11px] font-medium text-primary hover:underline"
              >
                <Phone className="size-3.5" />
                تماس با پشتیبانی
              </a>
            </div>
          </div>
        </aside>

        {/* clauses */}
        <div className="min-w-0 flex-1 space-y-8">
          <Terms />

          {/* footer acknowledgement */}
          <div className="flex flex-col gap-3 rounded-2xl border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <BadgeCheck className="size-4" strokeWidth={1.9} />
              </span>
              <p className="text-[11px] leading-5 text-muted-foreground">
                ادامه استفاده از پک‌ساز به‌منزله پذیرش نسخه‌ی فعلی قوانین است.
              </p>
            </div>

            <Link
              href="/contact-us"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border bg-background px-4 py-2 text-xs font-medium transition-colors hover:border-primary/30 hover:text-primary"
            >
              تماس با ما
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;

export const metadata = {
  title: "قوانین و مقررات",
  description:
    "صفحه قوانین و مقررات در وبسایت پکساز. با استفاده از این وبسایت، شما موافقت خود را با شرایط و قوانین ارائه شده در این صفحه اعلام می‌کنید.",
};
