import LoginCard from "@/components/forms/LoginCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const page = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/30 px-4 py-10">
      {/* brand wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(60%_100%_at_50%_0%,var(--color-primary),transparent_70%)] opacity-[0.10]"
      />

      {/* masked grid, faded towards the bottom */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full text-primary"
      >
        <defs>
          <pattern
            id="login-grid"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <path d="M28 0H0V28" fill="none" strokeWidth="1" />
          </pattern>
          <radialGradient id="login-fade" cx="50%" cy="12%" r="80%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="login-mask">
            <rect width="100%" height="100%" fill="url(#login-fade)" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#login-grid)"
          className="text-primary/25"
          mask="url(#login-mask)"
        />
      </svg>

      <div className="relative w-full">
        {/* back link */}
        <div className="mx-auto mb-4 w-full max-w-5xl">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            بازگشت به صفحه اصلی
          </Link>
        </div>

        <div className="flex justify-center">
          <LoginCard />
        </div>
      </div>
    </div>
  );
};

export default page;

export const metadata = {
  title: "ورود/ثبت نام",
  description:
    "صفحه ورود و ثبت نام در وبسایت پکساز. با ورود به حساب کاربری خود می‌توانید به امکانات و خدمات ویژه دسترسی پیدا کنید.",
};
