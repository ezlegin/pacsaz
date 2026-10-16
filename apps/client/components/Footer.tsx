import { cn } from "@repo/ui/lib/utils";
import {
  ArrowUpRight,
  Clock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { layoutPaddings } from "./Navbars/Navbar";
import PacsazLogo from "./PacsazLogo";

const EMAIL = "pacsaz.ir@gmail.com";
const PHONE = "09962224177";
const PHONE_LABEL = "۰۹۹۶-۲۲۲-۴۱۷۷";
const ENamadUrl =
  "https://trustseal.enamad.ir/?id=8198265&Code=MgGrRlsux4O6hcApzFke6ZHyDZIVsRrI";
const ENamadLogo =
  "https://trustseal.enamad.ir/logo.aspx?id=8198265&Code=MgGrRlsux4O6hcApzFke6ZHyDZIVsRrI";
const COURSE_URL = "https://igraphical.ir/courses/packaging";

const LINK_GROUPS = [
  {
    title: "دسترسی سریع",
    links: [
      { label: "صفحه اصلی", href: "/" },
      { label: "قالب‌ها", href: "/dielines" },
      { label: "اشتراک‌ها", href: "/subscription" },
      { label: "آموزش", href: COURSE_URL, external: true },
    ],
  },
  {
    title: "حساب کاربری",
    links: [
      { label: "پنل کاربری", href: "/panel" },
      { label: "علاقه‌مندی‌ها", href: "/panel/favs" },
      { label: "ذخیره‌شده‌ها", href: "/panel/saved" },
      { label: "پرداخت‌ها", href: "/panel/payments" },
    ],
  },
  {
    title: "پک‌ساز",
    links: [
      { label: "درباره ما", href: "/about-us" },
      { label: "سوالات متداول", href: "/faq" },
      { label: "تماس با ما", href: "/contact-us" },
      { label: "قوانین و مقررات", href: "/terms" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className={cn(layoutPaddings, "relative mt-16 overflow-hidden")}>
      {/* brand hairline across the very top */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/40 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-7xl pt-14">
        {/* ------------------------------ top grid ----------------------------- */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          {/* brand + contact */}
          <div className="space-y-6">
            <div className="space-y-4">
              <PacsazLogo scale={1.2} type="full" />

              <p className="max-w-sm text-sm leading-7 text-muted-foreground">
                پک‌ساز ابزاری هوشمند برای طراحی دقیق دایلاین‌های بسته‌بندی؛
                ساخته‌شده برای طراحان، چاپخانه‌ها و تیم‌های حرفه‌ای.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={`mailto:${EMAIL}`}
                className="group flex w-fit items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Mail className="size-3.5" strokeWidth={1.9} />
                </span>
                <span dir="ltr">{EMAIL}</span>
              </a>

              <a
                href={`tel:${PHONE}`}
                className="group flex w-fit items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Phone className="size-3.5" strokeWidth={1.9} />
                </span>
                <span>{PHONE_LABEL}</span>
              </a>

              <p className="flex items-center gap-2 pr-0.5 text-[11px] text-muted-foreground/80">
                <Clock className="size-3.5 shrink-0 text-primary/70" />
                پاسخ‌گویی شنبه تا چهارشنبه، ۹ تا ۱۴
              </p>
            </div>
          </div>

          {/* link columns */}
          {LINK_GROUPS.map((group) => (
            <nav key={group.title} className="space-y-4">
              <h3 className="text-xs font-bold tracking-wide">{group.title}</h3>

              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      <span className="h-1 w-1 rounded-full bg-primary/0 transition-colors group-hover:bg-primary" />
                      {link.label}
                      {link.external && (
                        <ArrowUpRight className="size-3 opacity-50 transition-opacity group-hover:opacity-100" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* ------------------------------- CTA strip --------------------------- */}
        <div className="mt-12 flex flex-col gap-4 rounded-3xl border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" strokeWidth={1.9} />
            </span>
            <div className="space-y-0.5">
              <p className="text-xs font-bold">
                آماده‌ای اولین دایلاینت را بسازی؟
              </p>
              <p className="text-[11px] text-muted-foreground">
                بدون آزمون و خطا، با ابعاد دقیق و بلید استاندارد چاپ.
              </p>
            </div>
          </div>

          <Link
            href="/dielines"
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-violet-500 to-purple-600 px-5 py-2.5 text-xs font-medium text-white shadow-sm transition-all duration-300 hover:gap-3 hover:shadow-lg hover:shadow-primary/30"
          >
            شروع کن
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        {/* ------------------------------ bottom bar --------------------------- */}
        <div className="mt-10 flex flex-col-reverse items-center gap-6 border-t py-6 sm:flex-row sm:justify-between">
          <p className="text-center text-[11px] text-muted-foreground sm:text-right">
            © {new Date().getFullYear()} پک‌ساز — تمامی حقوق محفوظ است.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex">
              <ShieldCheck className="size-3.5 text-primary" />
              پرداخت امن از طریق درگاه بانکی
            </span>

            <a
              referrerPolicy="origin"
              target="_blank"
              rel="noreferrer"
              href={ENamadUrl}
              className="transition-opacity hover:opacity-90"
            >
              {/* Remote seal: plain <img>, it is not a local asset. */}
              <img
                referrerPolicy="origin"
                data-code="1Wgxc21JlxfhD1Coppnv"
                src={ENamadLogo}
                alt="نماد اعتماد الکترونیکی"
                className="h-24 w-auto cursor-pointer rounded-sm"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
