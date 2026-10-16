"use client";

import { cn } from "@repo/ui/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

const NavLinks = ({
  items,
  className,
}: {
  items: NavItem[];
  className?: string;
}) => {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {items.map((item) => {
        const active = !item.external && isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors duration-200",
              active
                ? "text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}

            {item.external && (
              <ArrowUpRight className="size-3 opacity-50 transition-opacity group-hover:opacity-100" />
            )}

            {/* active underline */}
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gradient-to-l from-violet-500 to-purple-600 transition-opacity duration-200",
                active ? "opacity-100" : "opacity-0",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
};

export default NavLinks;
