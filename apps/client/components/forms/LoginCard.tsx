import {
  Boxes,
  FileType2,
  Ruler,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import PacsazLogo from "../PacsazLogo";
import LoginForm from "./login/LoginForm";

const HIGHLIGHTS = [
  { icon: Boxes, text: "کتابخانه‌ی قالب‌های آماده و لایه‌باز" },
  { icon: Ruler, text: "ابعاد دقیق با بلید استاندارد چاپ" },
  { icon: FileType2, text: "خروجی وکتور AI، PDF و DXF" },
];

/**
 * Login shell: a branded hero beside the form. The hero is a CSS/SVG
 * composition — no bitmap — so it scales and themes with the rest of the site.
 */
const LoginCard = () => {
  return (
    <div className="relative z-10 w-full max-w-5xl">
      <div className="grid overflow-hidden rounded-3xl border bg-background shadow-2xl shadow-primary/10 lg:grid-cols-[1.05fr_1fr]">
        {/* ------------------------------- hero -------------------------------- */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-bl from-violet-600 via-purple-600 to-violet-700 p-10 text-white lg:flex">
          {/* texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage:
                "radial-gradient(75% 60% at 30% 20%, black, transparent)",
              WebkitMaskImage:
                "radial-gradient(75% 60% at 30% 20%, black, transparent)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-white/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -right-20 size-72 rounded-full bg-fuchsia-400/25 blur-3xl"
          />

          <div className="relative space-y-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-medium backdrop-blur">
              <Sparkles className="size-3.5" />
              پلتفرم طراحی دایلاین بسته‌بندی
            </span>

            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold leading-snug tracking-tight">
                طراحی دایلاین،
                <br />
                بدون آزمون و خطا
              </h2>
              <p className="max-w-sm text-sm leading-7 text-white/75">
                وارد حساب کاربری خود شو تا قالب‌ها را شخصی‌سازی کنی، ذخیره کنی و
                خروجی آماده‌ی چاپ بگیری.
              </p>
            </div>
          </div>

          {/* art */}
          <div className="relative flex flex-1 items-center justify-center py-8">
            <svg
              viewBox="0 0 220 180"
              fill="none"
              className="h-44 w-auto text-white drop-shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
              aria-hidden
            >
              <defs>
                <linearGradient id="lg-fill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fff" stopOpacity="0.26" />
                  <stop offset="100%" stopColor="#fff" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="lg-stroke" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#fff" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              <path
                d="M70 40h70v90H70z"
                fill="url(#lg-fill)"
                stroke="url(#lg-stroke)"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M50 55h20v60H50z"
                fill="url(#lg-fill)"
                stroke="url(#lg-stroke)"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M140 55h20v60h-20z"
                fill="url(#lg-fill)"
                stroke="url(#lg-stroke)"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M70 40V22h70v18"
                fill="url(#lg-fill)"
                stroke="url(#lg-stroke)"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M160 55h14v60h-14"
                fill="url(#lg-fill)"
                stroke="url(#lg-stroke)"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />

              <g
                stroke="#fff"
                strokeOpacity="0.5"
                strokeWidth="1.2"
                strokeDasharray="5 5"
                strokeLinecap="round"
              >
                <path d="M70 40v90" />
                <path d="M50 55h20" />
                <path d="M140 55h20" />
                <path d="M160 55v60" />
                <path d="M70 40h70" />
              </g>

              <g stroke="#fff" strokeOpacity="0.55" strokeWidth="1.2">
                <path d="M70 152h70" strokeLinecap="round" />
                <path d="M70 148v8M140 148v8" strokeLinecap="round" />
              </g>

              <rect
                x="44"
                y="34"
                width="136"
                height="104"
                rx="6"
                stroke="#fff"
                strokeOpacity="0.3"
                strokeWidth="1.2"
                strokeDasharray="3 6"
              />
            </svg>
          </div>

          <ul className="relative space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/15 backdrop-blur">
                  <Icon className="size-3.5" strokeWidth={1.9} />
                </span>
                <span className="text-[12px] text-white/80">{text}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* ------------------------------- form -------------------------------- */}
        <section className="flex flex-col p-6 sm:p-9">
          <div className="mb-7 flex items-center justify-between gap-3">
            <Link
              href="/"
              className="transition-opacity hover:opacity-80"
              aria-label="صفحه اصلی پک‌ساز"
            >
              <PacsazLogo type="full" />
            </Link>

            <span className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-[10px] text-muted-foreground">
              <ShieldCheck className="size-3 text-primary" />
              ورود امن
            </span>
          </div>

          <LoginForm />

          <p className="mt-auto pt-7 text-center text-[10px] leading-5 text-muted-foreground">
            ورود به‌منزله‌ی پذیرش{" "}
            <Link href="/terms" className="font-medium text-primary hover:underline">
              قوانین و مقررات
            </Link>{" "}
            پک‌ساز است.
          </p>
        </section>
      </div>
    </div>
  );
};

export default LoginCard;
