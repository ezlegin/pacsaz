import { getSessionUser } from "@repo/auth/session";
import Diamond from "@/public/icons/Diamond";
import { calculateRemaningSubscription } from "@/utils/calculateRemaningSubscriptoin";
import { Button } from "@repo/ui/components/button";
import {
  Bookmark,
  CreditCard,
  Flag,
  Heart,
  LayoutDashboard,
  UserRound,
  Zap,
} from "lucide-react";
import Link from "next/link";
import UserMenu from "./UserMenu";

/**
 * Account controls for the desktop navbar. Rendered on the server (it reads the
 * session) and delegates the interactive parts to `UserMenu`.
 */
const NavbarButtons = async () => {
  const user = await getSessionUser();

  /* ------------------------------ signed out ------------------------------ */
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/subscription">
          <Button variant="ghost" className="text-muted-foreground">
            <Diamond />
            اشتراک
          </Button>
        </Link>

        <span aria-hidden className="h-6 w-px bg-border" />

        <Link href="/login">
          <Button variant="gradient">
            <UserRound className="size-4" />
            ورود / ثبت‌نام
          </Button>
        </Link>
      </div>
    );
  }

  /* ------------------------------- signed in ------------------------------ */
  const remainingDays = user.plan
    ? calculateRemaningSubscription(user.plan)
    : 0;
  const expiringSoon = Boolean(user.plan) && remainingDays <= 7;

  return (
    <div className="flex items-center gap-2">
      {/* plan state on the desktop bar */}
      {user.plan ? (
        <Link
          href={`/payment?plan=${user.plan.key}&period=${user.plan.period}`}
          className={`group inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold transition-all duration-200 hover:shadow-sm ${
            expiringSoon
              ? "border-amber-500/30 bg-amber-500/[0.07] text-amber-600 hover:border-amber-500/50"
              : "border-green-500/25 bg-green-500/[0.07] text-green-600 hover:border-green-500/45"
          }`}
        >
          <span className="relative flex size-1.5">
            <span
              className={`absolute inline-flex h-full w-full rounded-full ${
                expiringSoon ? "bg-amber-500" : "bg-green-500"
              } ${expiringSoon ? "animate-ping opacity-75" : "opacity-0"}`}
            />
            <span
              className={`relative inline-flex size-1.5 rounded-full ${
                expiringSoon ? "bg-amber-500" : "bg-green-500"
              }`}
            />
          </span>

          {expiringSoon
            ? `تمدید تا ${remainingDays.toLocaleString("fa-IR", {
                useGrouping: false,
              })} روز`
            : user.plan.title}

          <Zap className="size-3 opacity-60 transition-opacity group-hover:opacity-100" />
        </Link>
      ) : (
        <Link
          href="/subscription"
          className="group inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/[0.07] px-3 py-2 text-[11px] font-bold text-primary transition-all duration-200 hover:border-primary/45 hover:shadow-sm"
        >
          <Diamond />
          فعال‌سازی اشتراک
        </Link>
      )}

      <span aria-hidden className="h-6 w-px bg-border" />

      <UserMenu
        user={{
          fullName: user.fullName,
          plan: user.plan
            ? {
                title: user.plan.title,
                endsAtLabel: null,
                daysLeft: remainingDays,
              }
            : null,
        }}
      />
    </div>
  );
};

export default NavbarButtons;

/**
 * Account block for the mobile sheet. Larger tap targets, no dropdown.
 */
export const MobileAccountPanel = async () => {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="space-y-2">
        <Link href="/login" className="block">
          <Button variant="gradient" size="lg" className="w-full">
            ورود / ثبت‌نام
          </Button>
        </Link>
        <Link href="/subscription" className="block">
          <Button variant="outline" size="lg" className="w-full">
            <Diamond />
            مشاهده پلن‌ها
          </Button>
        </Link>
      </div>
    );
  }

  const remainingDays = user.plan
    ? calculateRemaningSubscription(user.plan)
    : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-2xl border bg-gradient-to-bl from-primary/[0.07] to-transparent p-3.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-extrabold text-white">
          {user.fullName.trim().charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold">{user.fullName}</p>
          <p className="truncate text-[10px] text-muted-foreground">
            {user.plan
              ? `${user.plan.title} · ${remainingDays.toLocaleString("fa-IR", {
                  useGrouping: false,
                })} روز مانده`
              : "بدون اشتراک فعال"}
          </p>
        </div>
      </div>

      <div className="grid gap-1.5">
        {MOBILE_LINKS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon className="size-3.5 text-muted-foreground" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
};

const MOBILE_LINKS = [
  { label: "داشبورد", href: "/panel", icon: LayoutDashboard },
  { label: "سوابق اشتراک", href: "/panel/subscriptions", icon: Flag },
  { label: "علاقه‌مندی‌ها", href: "/panel/favs", icon: Heart },
  { label: "ذخیره‌شده‌ها", href: "/panel/saved", icon: Bookmark },
  { label: "پرداخت‌ها", href: "/panel/payments", icon: CreditCard },
];
