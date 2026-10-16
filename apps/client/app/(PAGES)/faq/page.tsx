import FaqBrowser from "@/components/FaqBrowser";
import { FAQ_CATEGORIES, FAQ_ITEMS } from "@/data/faq";
import { ArrowLeft, CircleQuestionMark, MessagesSquare } from "lucide-react";
import Link from "next/link";

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

const page = () => {
  /** Structured data so search engines can surface the answers directly. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ------------------------------- header ------------------------------ */}
      <header className="relative overflow-hidden rounded-3xl border bg-gradient-to-bl from-primary/[0.09] via-background to-background p-6 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
            <CircleQuestionMark className="size-3.5" />
            مرکز راهنما
          </span>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              سوالات{" "}
              <span className="bg-gradient-to-l from-violet-500 to-purple-600 bg-clip-text text-transparent">
                متداول
              </span>
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              پاسخ {fa(FAQ_ITEMS.length)} سوال پرتکرار درباره‌ی پک‌ساز، اشتراک‌ها
              و حساب کاربری. اگر پاسخ سوالت را پیدا نکردی، از صفحه‌ی تماس با ما
              بپرس.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/contact-us"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-violet-500 to-purple-600 px-4 py-2.5 text-xs font-medium text-white shadow-sm transition-all duration-300 hover:gap-3 hover:shadow-lg hover:shadow-primary/30"
            >
              <MessagesSquare className="size-3.5" />
              سوالت را بپرس
              <ArrowLeft className="size-3.5" />
            </Link>

            <Link
              href="/subscription"
              className="rounded-xl border bg-background px-4 py-2.5 text-xs font-medium transition-colors hover:border-primary/30 hover:text-primary"
            >
              مشاهده‌ی پلن‌ها
            </Link>
          </div>

          {/* categories at a glance */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t pt-4">
            {FAQ_CATEGORIES.map((cat) => (
              <span
                key={cat.id}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
              >
                <span className="size-1 rounded-full bg-primary/60" />
                {cat.title} ·{" "}
                {fa(
                  FAQ_ITEMS.filter((item) => item.category === cat.id).length,
                )}{" "}
                سوال
              </span>
            ))}
          </div>
        </div>
      </header>

      <FaqBrowser items={FAQ_ITEMS} />

      {/* ------------------------------ support CTA --------------------------- */}
      <div className="flex flex-col gap-4 rounded-3xl border bg-muted/40 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <MessagesSquare className="size-5" strokeWidth={1.9} />
          </span>
          <div className="space-y-0.5">
            <p className="text-xs font-bold">پاسخت را پیدا نکردی؟</p>
            <p className="text-[11px] leading-6 text-muted-foreground">
              پیامت را بفرست؛ در سامانه ثبت می‌شود و از طریق ایمیل پاسخ
              می‌گیری.
            </p>
          </div>
        </div>

        <Link
          href="/contact-us"
          className="shrink-0 rounded-xl border bg-background px-4 py-2.5 text-center text-xs font-medium transition-colors hover:border-primary/30 hover:text-primary"
        >
          تماس با ما
        </Link>
      </div>
    </div>
  );
};

export default page;

export const metadata = {
  title: "سوالات متداول",
  description:
    "پاسخ سوالات پرتکرار درباره‌ی پک‌ساز: خروجی دایلاین‌ها، متریال‌ها و بلید، تفاوت پلن‌های اشتراک، سهمیه دانلود، پرداخت و مدیریت حساب کاربری.",
};
