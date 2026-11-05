import { buildMetadata } from "@/lib/seo";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";

/** Next.js answers this with a real 404; `noIndex` covers any soft case. */
export const metadata = buildMetadata({
  title: "صفحه پیدا نشد",
  description: "صفحه‌ای که دنبالش بودی پیدا نشد.",
  path: "/404",
  noIndex: true,
});

/** Links back into the site, so a dead URL does not end the visit or the crawl. */
export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-5xl font-extrabold text-primary">۴۰۴</p>
      <h1 className="text-xl font-extrabold">این صفحه پیدا نشد</h1>
      <p className="max-w-sm text-sm leading-7 text-muted-foreground">
        ممکن است نشانی اشتباه باشد یا این قالب دیگر منتشر نشده باشد.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/dielines">
          <Button variant="gradient">کتابخانه قالب‌ها</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">صفحه اصلی</Button>
        </Link>
      </div>
    </main>
  );
}
