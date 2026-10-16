import FaqAccordion from "@/components/FaqAccordion";
import { faqsByCategory } from "@/data/faq";
import { ArrowLeft, CreditCard } from "lucide-react";
import Link from "next/link";

/** Home-page teaser for billing and subscription questions. */
const HomeSubFAQ = () => {
  const items = faqsByCategory("subscription").slice(0, 5);

  return (
    <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-start">
      {/* ------------------------------- heading ------------------------------ */}
      <div className="w-full space-y-4 lg:sticky lg:top-24 lg:w-2/5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
          <CreditCard className="size-3.5" />
          اشتراک و پرداخت
        </span>

        <h2 className="text-2xl font-extrabold tracking-tight">
          سوالات متداول درباره‌ی اشتراک
        </h2>

        <p className="text-sm leading-7 text-muted-foreground">
          هر چیزی که پیش از خرید اشتراک لازم است بدانی: تفاوت پلن‌ها، سهمیه‌ی
          دانلود، روش پرداخت و شرایط تغییر یا تمدید پلن.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/subscription"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-violet-500 to-purple-600 px-4 py-2.5 text-xs font-medium text-white shadow-sm transition-all duration-300 hover:gap-3 hover:shadow-lg hover:shadow-primary/30"
          >
            مشاهده‌ی پلن‌ها
            <ArrowLeft className="size-3.5" />
          </Link>

          <Link
            href="/faq"
            className="rounded-xl border bg-background px-4 py-2.5 text-xs font-medium transition-colors hover:border-primary/30 hover:text-primary"
          >
            همه‌ی سوالات
          </Link>
        </div>
      </div>

      {/* -------------------------------- list -------------------------------- */}
      <div className="w-full lg:w-3/5">
        <FaqAccordion items={items} />
      </div>
    </div>
  );
};

export default HomeSubFAQ;
