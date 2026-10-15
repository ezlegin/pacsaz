"use client";

import { cn } from "@repo/ui/lib/utils";
import {
  Bookmark,
  CreditCard,
  Flag,
  Heart,
  LayoutDashboard,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The nav items live here, not in the server sidebar, because `icon` holds a
 * component reference. Functions cannot be serialised across the
 * server → client boundary, so passing this array as a prop throws
 * "Functions cannot be passed directly to Client Components".
 */
const ITEMS = [
  { title: "داشبورد", url: "/panel", icon: LayoutDashboard },
  { title: "سوابق اشتراک", url: "/panel/subscriptions", icon: Flag },
  { title: "علاقه‌مندی ها", url: "/panel/favs", icon: Heart },
  { title: "ذخیره شده", url: "/panel/saved", icon: Bookmark },
  { title: "مشتری‌ها", url: "/panel/customers", icon: Users },
  { title: "پرداخت ها", url: "/panel/payments", icon: CreditCard },
  { title: "مشخصات", url: "/panel/profile", icon: User },
];

/**
 * Active-aware navigation for the panel sidebar. Kept as a client island so the
 * sidebar itself can stay a server component and read the session directly.
 */
const PanelNav = () => {
  const pathname = usePathname();

  const isActive = (url: string) =>
    url === "/panel" ? pathname === "/panel" : pathname.startsWith(url);

  return (
    <ul className="space-y-1.5">
      {ITEMS.map(({ title, url, icon: Icon }) => {
        const active = isActive(url);

        return (
          <li key={url}>
            <Link
              href={url}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {/* active rail */}
              <span
                aria-hidden
                className={cn(
                  "absolute right-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary transition-opacity",
                  active ? "opacity-100" : "opacity-0",
                )}
              />

              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-background",
                )}
              >
                <Icon className="size-4" strokeWidth={1.9} />
              </span>

              {title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default PanelNav;
