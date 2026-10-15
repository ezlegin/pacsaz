import ContactUsForm from "@/components/forms/ContactUsForm";
import { getSessionUser } from "@repo/auth/session";
import {
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const EMAIL = "pacsaz.ir@gmail.com";
const PHONE = "09962224177";
const PHONE_LABEL = "۰۹۹۶-۲۲۲-۴۱۷۷";

const page = async () => {
  const user = await getSessionUser();

  const channels = [
    {
      icon: Mail,
      label: "ایمیل پشتیبانی",
      value: EMAIL,
      href: `mailto:${EMAIL}`,
      ltr: true,
      hint: "پاسخ‌گویی در روزهای کاری",
    },
    {
      icon: Phone,
      label: "شماره تماس",
      value: PHONE_LABEL,
      href: `tel:${PHONE}`,
      hint: "شنبه تا چهارشنبه، ۹ تا ۱۴",
    },
    {
      icon: Clock,
      label: "ساعات پاسخ‌گویی",
      value: "۹:۰۰ تا ۱۴:۰۰",
      hint: "شنبه تا چهارشنبه",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* ------------------------------- header ------------------------------ */}
      <header className="relative overflow-hidden rounded-3xl border bg-gradient-to-bl from-primary/[0.09] via-background to-background p-6 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
            <Sparkles className="size-3.5" />
            پشتیبانی پک‌ساز
          </span>

          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            با ما در{" "}
            <span className="bg-gradient-to-l from-violet-500 to-purple-600 bg-clip-text text-transparent">
              تماس
            </span>{" "}
            باش
          </h1>

          <p className="text-sm leading-7 text-muted-foreground">
            سؤال فنی داری، پیشنهادی برای بهتر شدن پک‌ساز داری یا درباره‌ی اشتراک
            ابهامی داری؟ فرم زیر را پر کن یا از راه‌های تماس مستقیم استفاده کن.
            پیام‌ها به‌صورت ایمیل پاسخ داده می‌شوند.
          </p>
        </div>
      </header>

      {/* -------------------------------- body ------------------------------ */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* form */}
        <div className="min-w-0">
          <ContactUsForm user={user} />
        </div>

        {/* channels */}
        <aside className="space-y-4">
          <section className="space-y-4 rounded-3xl border bg-background p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <MessageSquare className="size-4" strokeWidth={1.9} />
              </span>
              <div>
                <h2 className="text-xs font-bold">راه‌های ارتباطی</h2>
                <p className="text-[10px] text-muted-foreground">
                  برای پیام‌های فوری
                </p>
              </div>
            </div>

            <ul className="space-y-4">
              {channels.map(({ icon: Icon, label, value, href, hint, ltr }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <Icon className="size-3.5" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        dir={ltr ? "ltr" : undefined}
                        className="block truncate text-xs font-bold text-primary hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="truncate text-xs font-bold">{value}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground">{hint}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* what to include */}
          <section className="space-y-3 rounded-3xl border bg-muted/30 p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="size-4" strokeWidth={1.9} />
              </span>
              <h2 className="text-xs font-bold">برای پاسخ سریع‌تر</h2>
            </div>

            <ul className="space-y-2">
              {[
                "اگر مشکل فنی است، نام مرورگر و دستگاه را بنویس.",
                "اگر درباره‌ی قالب خاصی است، نام یا لینک آن را ضمیمه کن.",
                "اگر درباره‌ی پرداخت است، شناسه‌ی تراکنش را ذکر کن.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[11px] leading-6 text-muted-foreground"
                >
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-primary/60" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* address note */}
          <section className="flex items-start gap-3 rounded-3xl border bg-background p-5">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
              <MapPin className="size-3.5" strokeWidth={1.9} />
            </span>
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground">
                پشتیبانی آنلاین
              </p>
              <p className="text-[11px] leading-6 text-muted-foreground">
                پک‌ساز یک سرویس آنلاین است و دفتر حضوری برای مراجعه ندارد؛
                همه‌ی ارتباطات از طریق ایمیل و تلفن انجام می‌شود.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default page;

export const metadata = {
  title: "تماس با ما",
  description:
    "صفحه تماس با ما در وبسایت پکساز. برای ارتباط با تیم پک ساز، می‌توانید از طریق ایمیل یا شماره تماس ارائه شده در این صفحه اقدام نمایید.",
};
