"use client";

import { cn } from "@repo/ui/lib/utils";
import { signOut } from "@repo/auth/react";
import {
  Bookmark,
  ChevronDown,
  CreditCard,
  Flag,
  Heart,
  LayoutDashboard,
  LogOut,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type NavbarUser = {
  fullName: string;
  plan: { title: string; endsAtLabel: string | null; daysLeft: number } | null;
};

const MENU = [
  { label: "داشبورد", href: "/panel", icon: LayoutDashboard },
  { label: "سوابق اشتراک", href: "/panel/subscriptions", icon: Flag },
  { label: "علاقه‌مندی‌ها", href: "/panel/favs", icon: Heart },
  { label: "ذخیره‌شده‌ها", href: "/panel/saved", icon: Bookmark },
  { label: "پرداخت‌ها", href: "/panel/payments", icon: CreditCard },
  { label: "مشخصات", href: "/panel/profile", icon: UserRound },
];

/** Compact account control for the desktop navbar. */
const UserMenu = ({ user }: { user: NavbarUser }) => {
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initial = user.fullName.trim().charAt(0);
  const expiringSoon = user.plan ? user.plan.daysLeft <= 7 : false;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "group flex items-center gap-2 rounded-xl border bg-background py-1.5 pl-2.5 pr-1.5 text-left transition-all duration-200",
          open
            ? "border-primary/30 shadow-sm"
            : "hover:border-primary/25 hover:shadow-sm",
        )}
      >
        <span className="grid size-5 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-[10px] font-extrabold text-white shadow-sm shadow-primary/20">
          {initial}
        </span>

        <span className="hidden min-w-0 lg:block">
          <span className="block max-w-28 truncate text-[11px] font-bold leading-tight">
            {user.fullName}
          </span>
        </span>

        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* ------------------------------- panel ------------------------------- */}
      <div
        role="menu"
        className={cn(
          "absolute left-0 top-[calc(100%+8px)] z-50 w-60 origin-top overflow-hidden rounded-2xl border bg-background shadow-xl shadow-primary/5 transition-all duration-200",
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0",
        )}
      >
        {/* plan summary */}
        <div className="space-y-2 border-b bg-gradient-to-bl from-primary/[0.07] to-transparent p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-muted-foreground">پلن فعلی</span>
            {user.plan ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  expiringSoon
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-green-500/10 text-green-600",
                )}
              >
                {user.plan.daysLeft > 0
                  ? `${user.plan.daysLeft.toLocaleString("fa-IR", {
                      useGrouping: false,
                    })} روز مانده`
                  : "منقضی شده"}
              </span>
            ) : (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                ندارد
              </span>
            )}
          </div>

          <p className="text-sm font-extrabold">
            {user.plan ? user.plan.title : "اشتراک فعالی نداری"}
          </p>

          {!user.plan && (
            <Link
              href="/subscription"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-l from-violet-500 to-purple-600 px-3 py-1.5 text-[11px] font-bold text-white transition-opacity hover:opacity-90"
            >
              فعال‌سازی اشتراک
            </Link>
          )}
        </div>

        {/* links */}
        <ul className="p-1.5">
          {MENU.map(({ label, href, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* sign out */}
        <div className="border-t p-1.5">
          <button
            type="button"
            role="menuitem"
            disabled={isSigningOut}
            onClick={() => {
              setIsSigningOut(true);
              void signOut({ redirectTo: "/" });
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
          >
            <LogOut className="size-3.5 shrink-0" />
            {isSigningOut ? "در حال خروج..." : "خروج از حساب"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserMenu;
