import DielineNavbar from "@/components/Navbars/DielineNavbar";
import PacsazLogo from "@/components/PacsazLogo";
import { Button } from "@repo/ui/components/button";
import { prisma } from "@repo/db";
import { LayoutGrid, MonitorSmartphone, MoveRight, Ruler } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dieline = await prisma.dieline.findFirst({ where: { slug } });

  if (!dieline) return notFound();

  return (
    <div className="relative flex h-[calc(100vh-var(--app-top-offset))] flex-col overflow-hidden bg-muted/40">
      <DielineNavbar dieline={dieline} />

      {/* ----------------------------- desktop only ---------------------------- */}
      <div className="hidden min-h-0 flex-1 lg:block">{children}</div>

      {/* ------------------------------ small screens -------------------------- */}
      <div className="relative flex flex-1 items-center justify-center overflow-y-auto px-5 py-10 lg:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,var(--color-primary),transparent_70%)] opacity-[0.10]"
        />

        <div className="relative w-full max-w-md space-y-6 text-center">
          <div className="flex justify-center">
            <span className="grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl shadow-primary/25">
              <MonitorSmartphone className="size-7" strokeWidth={1.7} />
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-xl font-extrabold tracking-tight">
              متأسفانه فعلاً روی موبایل قابل استفاده نیست
            </h1>
            <p className="text-sm leading-7 text-muted-foreground">
              محیط ادیتور پک‌ساز برای کار با دایلاین‌ها طراحی شده و به فضای
              کافی، خط‌کش‌های دقیق و پنل‌های تنظیمات نیاز دارد؛ به همین دلیل
              فعلاً روی نمایشگرهای کوچک در دسترس نیست. بابت این محدودیت از شما
              عذر می‌خواهیم.
            </p>
          </div>

          <ul className="space-y-2 rounded-2xl border bg-background/70 p-4 text-right backdrop-blur">
            {[
              {
                icon: Ruler,
                text: "تنظیم دقیق ابعاد، متریال و بلید نیاز به فضای افقی دارد.",
              },
              {
                icon: LayoutGrid,
                text: "پیش‌نمایش دایلاین در کنار پنل تنظیمات نمایش داده می‌شود.",
              },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-3.5" strokeWidth={1.9} />
                </span>
                <span className="text-[11px] leading-6 text-muted-foreground">
                  {text}
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-3">
            <p className="text-xs font-bold">
              لطفاً با یک نمایشگر بزرگ‌تر (لپ‌تاپ یا دسکتاپ) دوباره وارد شوید.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link href="/dielines" className="w-full sm:w-auto">
                <Button variant="gradient" size="lg" className="group w-full">
                  مشاهده‌ی کتابخانه قالب‌ها
                  <MoveRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact-us" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  تماس با پشتیبانی
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <PacsazLogo type="full" scale={0.9} grayout />
          </div>
        </div>
      </div>
    </div>
  );
}
