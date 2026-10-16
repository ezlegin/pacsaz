import FaqAccordion from "@/components/FaqAccordion";
import { FAQ_ITEMS, faqsByCategory } from "@/data/faq";
import { ArrowLeft, CircleQuestionMark } from "lucide-react";
import Link from "next/link";

/** Home-page teaser for the product questions. */
const FAQ = () => {
  const items = faqsByCategory("product").slice(0, 5);

  return (
    <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-start">
      {/* ------------------------------- heading ------------------------------ */}
      <div className="w-full space-y-4 lg:sticky lg:top-24 lg:w-2/5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
          <CircleQuestionMark className="size-3.5" />
          سوالات متداول
        </span>

        <h2 className="text-2xl font-extrabold tracking-tight">
          سوالات پرتکرار درباره‌ی پک‌ساز
        </h2>

        <p className="text-sm leading-7 text-muted-foreground">
          پاسخ کوتاه پرتکرارترین سوال‌ها را اینجا جمع کرده‌ایم. اگر پاسخ سوالت
          اینجا نبود، از صفحه‌ی سوالات متداول یا بخش پشتیبانی کمک بگیر.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/faq"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-violet-500 to-purple-600 px-4 py-2.5 text-xs font-medium text-white shadow-sm transition-all duration-300 hover:gap-3 hover:shadow-lg hover:shadow-primary/30"
          >
            همه‌ی سوالات متداول
            <ArrowLeft className="size-3.5" />
          </Link>

          <Link
            href="/contact-us"
            className="rounded-xl border bg-background px-4 py-2.5 text-xs font-medium transition-colors hover:border-primary/30 hover:text-primary"
          >
            پرسیدن سوال
          </Link>
        </div>

        <p className="text-[11px] text-muted-foreground">
          {FAQ_ITEMS.length.toLocaleString("fa-IR", { useGrouping: false })} سوال
          پاسخ‌داده‌شده در سه دسته
        </p>
      </div>

      {/* -------------------------------- list -------------------------------- */}
      <div className="w-full lg:w-3/5">
        <FaqAccordion items={items} defaultOpenId={items[0]?.id} />
      </div>
    </div>
  );
};

export default FAQ;
