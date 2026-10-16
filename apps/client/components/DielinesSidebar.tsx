"use client";

import { DielineCategoryByModel, DielineCategoryByUsage } from "@repo/db";
import { cn } from "@repo/ui/lib/utils";
import { Check, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type DielineCount = { _count: { dieline: number } };

export interface DielinesSidebarProps {
  categoriesByUsage: (DielineCategoryByUsage & DielineCount)[];
  categoriesByModel: (DielineCategoryByModel & DielineCount)[];
  /** Slug of the category currently applied, if any. */
  activeCategory?: string;
  className?: string;
  /** Called after a category is followed — lets a mobile sheet close itself. */
  onSelect?: (slug: string | undefined) => void;
}

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

/**
 * The category rail.
 *
 * Categories are `<Link>`s to `/dielines/category/<slug>`, not buttons that write
 * a query parameter. A crawler cannot follow a click handler, so the query-param
 * version left every category page undiscoverable and unindexable; real hrefs
 * make each one a first-class URL with its own title, description and structured
 * data.
 */
const DielinesSidebar = ({
  categoriesByModel,
  categoriesByUsage,
  activeCategory,
  className,
  onSelect,
}: DielinesSidebarProps) => {
  const [query, setQuery] = useState("");

  const match = (title: string) =>
    query.trim() === "" || title.includes(query.trim());

  const groups = [
    {
      key: "usage",
      label: "بر اساس کاربرد",
      items: categoriesByUsage.filter((c) => match(c.title)),
    },
    {
      key: "model",
      label: "بر اساس مدل",
      items: categoriesByModel.filter((c) => match(c.title)),
    },
  ];

  const totalMatches = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className={cn("space-y-5", className)}>
      {/* ------------------------------- search ------------------------------ */}
      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجوی دسته‌بندی..."
          className="h-10 w-full rounded-xl border bg-background pr-9 pl-9 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
        />

        {query !== "" && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="پاک کردن جستجو"
            className="absolute left-2.5 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {/* --------------------------- clear filter ---------------------------- */}
      {activeCategory && (
        <Link
          href="/dielines"
          onClick={() => onSelect?.(undefined)}
          className="flex w-full items-center justify-between rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-[11px] font-bold text-primary transition-colors hover:bg-primary/15"
        >
          <span className="flex items-center gap-1.5">
            <Check className="size-3.5" />
            فیلتر فعال است
          </span>
          <span className="flex items-center gap-1 text-[10px] opacity-80">
            حذف
            <X className="size-3" />
          </span>
        </Link>
      )}

      {/* ------------------------------- groups ----------------------------- */}
      {totalMatches === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-[11px] text-muted-foreground">
          دسته‌بندی‌ای با این نام پیدا نشد.
        </p>
      ) : (
        groups.map((group) =>
          group.items.length === 0 ? null : (
            <div key={group.key} className="space-y-2.5">
              <div className="flex items-center gap-2">
                <h3 className="text-[11px] font-bold text-muted-foreground">
                  {group.label}
                </h3>
                <span className="h-px flex-1 bg-border" />
                <span className="text-[10px] text-muted-foreground/70">
                  {fa(group.items.length)}
                </span>
              </div>

              <ul className="space-y-1">
                {group.items.map((category) => {
                  const active = category.slug === activeCategory;
                  const empty = category._count.dieline === 0;

                  return (
                    <li key={category.id}>
                      <Link
                        href={`/dielines/category/${category.slug}`}
                        onClick={() => onSelect?.(category.slug)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-right text-xs transition-all duration-200",
                          active
                            ? "bg-primary/10 font-bold text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          empty && !active && "opacity-50",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-4 shrink-0 place-items-center rounded-md border transition-colors",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border group-hover:border-primary/40",
                          )}
                        >
                          {active && (
                            <Check className="size-2.5" strokeWidth={4} />
                          )}
                        </span>

                        <span className="flex-1 truncate">{category.title}</span>

                        <span
                          className={cn(
                            "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                            active
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {fa(category._count.dieline)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ),
        )
      )}
    </div>
  );
};

export default DielinesSidebar;
