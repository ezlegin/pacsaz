"use client";

import FaqAccordion from "@/components/FaqAccordion";
import { FAQ_CATEGORIES, type FaqItem } from "@/data/faq";
import { cn } from "@repo/ui/lib/utils";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

/**
 * Filterable FAQ browser for the standalone page. Search matches the question
 * *and* the answer, so a visitor looking for a half-remembered phrase still
 * finds it.
 */
const FaqBrowser = ({ items }: { items: FaqItem[] }) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    const term = query.trim();

    return items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!term) return true;
      return (
        item.question.includes(term) || item.answer.includes(term)
      );
    });
  }, [items, query, category]);

  /** Group the results so category context survives while searching. */
  const groups = useMemo(() => {
    return FAQ_CATEGORIES.map((cat) => ({
      ...cat,
      items: filtered.filter((item) => item.category === cat.id),
    })).filter((group) => group.items.length > 0);
  }, [filtered]);

  const tabs = [
    { id: "all", title: "همه", count: items.length },
    ...FAQ_CATEGORIES.map((cat) => ({
      id: cat.id,
      title: cat.title,
      count: items.filter((item) => item.category === cat.id).length,
    })),
  ];

  return (
    <div className="space-y-8">
      {/* -------------------------------- search ------------------------------ */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در سوالات..."
            aria-label="جستجو در سوالات متداول"
            className="h-12 w-full rounded-2xl border bg-background pr-10 pl-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          />

          {query !== "" && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="پاک کردن جستجو"
              className="absolute left-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* category tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map((tab) => {
            const active = category === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategory(tab.id)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all duration-200",
                  active
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "bg-background text-muted-foreground hover:border-primary/25 hover:text-foreground",
                )}
              >
                {tab.title}
                <span
                  className={cn(
                    "rounded-md px-1.5 text-[10px] font-bold tabular-nums",
                    active
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {fa(tab.count)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* -------------------------------- results ----------------------------- */}
      {filtered.length === 0 ? (
        <FaqAccordion items={[]} />
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.id} className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-[11px] font-extrabold text-primary">
                  {fa(group.items.length)}
                </span>
                <div className="space-y-0.5">
                  <h2 className="text-sm font-extrabold tracking-tight">
                    {group.title}
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {group.description}
                  </p>
                </div>
              </div>

              <FaqAccordion items={group.items} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default FaqBrowser;
