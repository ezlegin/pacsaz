// Lives in the app rather than @repo/ui: it imports next/navigation, and Next.js
// imports inside the shared UI package make Vercel treat packages/ui as a
// deployable service. The admin and client apps each keep their own copy.
"use client";

import { cn } from "@repo/ui/lib/utils";
import { buttonVariants } from "@repo/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface Props {
  pageSize: number;
  totalItems: number;
  paramName?: string;
  lang?: "fa" | "en";
}

/**
 * `useSearchParams` opts the closest Suspense boundary into client rendering, so
 * that boundary has to live inside this component. Without it every page that
 * renders <Pagination /> bails out of prerendering and fails the build with
 * "useSearchParams() should be wrapped in a suspense boundary".
 */
const Pagination = (props: Props) => (
  <Suspense fallback={null}>
    <PaginationBar {...props} />
  </Suspense>
);

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

const PaginationBar = ({
  pageSize,
  totalItems,
  paramName = "page",
  lang = "en",
}: Props) => {
  const pageCount = Math.ceil(totalItems / pageSize);

  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get(paramName) || "1");

  /**
   * Real links rather than click handlers: a crawler follows `href`s and never
   * clicks, so a button-driven pager hides everything past the first page.
   * Page 1 drops the parameter, because the bare URL is its canonical.
   */
  const pageHref = (page: number) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (page <= 1) params.delete(paramName);
    else params.set(paramName, page.toString());

    const query = params.toString();
    return query ? `?${query}` : "?";
  };

  const linkClass = cn(
    buttonVariants({ variant: "outline", size: "icon" }),
    "size-8 rounded-xl",
  );
  const disabledClass = cn(linkClass, "pointer-events-none opacity-50");

  if (pageCount < 2) return null;

  const isFa = lang === "fa";
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      dir={isFa ? "rtl" : "ltr"}
      className="flex flex-col items-center justify-between gap-4 rounded-2xl border bg-background px-5 py-3.5 sm:flex-row"
    >
      <p className="text-[11px] text-muted-foreground">
        {isFa
          ? `نمایش ${fa(from)} تا ${fa(to)} از ${fa(totalItems)} مورد`
          : `Showing ${from}–${to} of ${totalItems}`}
      </p>

      <div className="flex items-center gap-1.5">
        {currentPage > 1 ? (
          <Link
            href={pageHref(currentPage - 1)}
            rel="prev"
            className={linkClass}
            aria-label={isFa ? "صفحه قبل" : "Previous page"}
          >
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span aria-disabled className={disabledClass}>
            <ChevronRight className="size-4" />
          </span>
        )}

        <span
          className={cn(
            "rounded-xl bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary",
          )}
        >
          {isFa
            ? `${fa(currentPage)} / ${fa(pageCount)}`
            : `${currentPage} / ${pageCount}`}
        </span>

        {currentPage < pageCount ? (
          <Link
            href={pageHref(currentPage + 1)}
            rel="next"
            className={linkClass}
            aria-label={isFa ? "صفحه بعد" : "Next page"}
          >
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <span aria-disabled className={disabledClass}>
            <ChevronLeft className="size-4" />
          </span>
        )}
      </div>
    </div>
  );
};

export default Pagination;
