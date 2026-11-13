import { LEGAL_UPDATED, type LegalDoc } from "@/data/legal";
import { CONTACT } from "@/lib/seo/site";
import { cn } from "@repo/ui/lib/utils";
import { Mail } from "lucide-react";
import Link from "next/link";

const fa = (value: number) => value.toLocaleString("fa-IR", { useGrouping: false });

const DOCS = [
  { href: "/terms", label: "قوانین و مقررات" },
  { href: "/privacy", label: "حریم خصوصی" },
] as const;

/**
 * The terms and the privacy policy share one layout: a tab between the two,
 * a sticky contents list, and articles of numbered clauses. Articles are a
 * real sequence ("ماده ۳، بند ۲" is how people cite them), hence the numbers.
 */
export default function LegalPage({ doc, path }: { doc: LegalDoc; path: "/terms" | "/privacy" }) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="max-w-3xl space-y-5 pb-10">
        <nav aria-label="اسناد حقوقی" className="inline-flex rounded-xl border bg-muted/50 p-1">
          {DOCS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.href === path ? "page" : undefined}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                item.href === path
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <h1 className="text-3xl font-black md:text-4xl">{doc.title}</h1>
        <p className="text-base leading-8 text-muted-foreground">{doc.intro}</p>
        <p className="text-xs text-muted-foreground">آخرین به‌روزرسانی: {LEGAL_UPDATED}</p>
      </header>

      <div className="flex gap-12 border-t pt-10">
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav aria-label="فهرست مطالب" className="sticky top-24 space-y-5">
            <ol className="space-y-0.5">
              {doc.sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <span className="w-5 shrink-0 tabular-nums text-primary">{fa(index + 1)}</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>

            {CONTACT.email && (
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-2 border-t px-2.5 pt-5 text-sm font-medium text-primary hover:underline"
              >
                <Mail className="size-4" />
                سؤال دارید؟ ایمیل بزنید
              </a>
            )}
          </nav>
        </aside>

        <div className="min-w-0 max-w-3xl flex-1 space-y-12">
          {doc.sections.map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
              <div className="space-y-1">
                <h2 className="flex items-baseline gap-3 text-xl font-extrabold">
                  <span className="text-sm font-bold text-primary">ماده {fa(index + 1)}</span>
                  {section.title}
                </h2>
                <p className="text-sm text-muted-foreground">{section.summary}</p>
              </div>

              <ol className="space-y-3">
                {section.clauses.map((clause, clauseIndex) => (
                  <li key={clauseIndex} className="flex gap-3 text-[15px] leading-8">
                    <span className="mt-0.5 w-6 shrink-0 text-sm tabular-nums text-muted-foreground">
                      {fa(index + 1)}.{fa(clauseIndex + 1)}
                    </span>
                    <p>{clause}</p>
                  </li>
                ))}
              </ol>
            </section>
          ))}

          <footer className="flex flex-col gap-4 rounded-2xl border bg-muted/40 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="font-bold">سؤالی باقی مانده؟</p>
              <p className="text-sm text-muted-foreground">
                {CONTACT.email ? (
                  <>
                    به <span dir="ltr">{CONTACT.email}</span> ایمیل بزنید
                    {CONTACT.telephoneLabel && <> یا با {CONTACT.telephoneLabel} تماس بگیرید</>}.
                  </>
                ) : (
                  "از صفحه‌ی تماس با ما پیام دهید."
                )}
              </p>
            </div>
            <Link
              href="/contact-us"
              className="inline-flex shrink-0 items-center justify-center rounded-xl border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
            >
              تماس با ما
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
}
