// Lives in the app rather than @repo/ui: it imports next/navigation, and Next.js
// imports inside the shared UI package make Vercel treat packages/ui as a
// deployable service. The admin and client apps each keep their own copy.
"use client";

import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
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

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get(paramName) || "1");

  const pageHandler = (pageAction: PageAction) => {
    const page = currentPage + (pageAction === "inc" ? 1 : -1);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set(paramName, page.toString());

    router.push(`?${params.toString()}`);
  };

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
        <Button
          size="icon"
          variant="outline"
          className="size-8 rounded-xl"
          onClick={() => pageHandler("dec")}
          disabled={currentPage <= 1}
          aria-label={isFa ? "صفحه قبل" : "Previous page"}
        >
          <ChevronRight className="size-4" />
        </Button>

        <span
          className={cn(
            "rounded-xl bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary",
          )}
        >
          {isFa
            ? `${fa(currentPage)} / ${fa(pageCount)}`
            : `${currentPage} / ${pageCount}`}
        </span>

        <Button
          size="icon"
          variant="outline"
          className="size-8 rounded-xl"
          onClick={() => pageHandler("inc")}
          disabled={currentPage >= pageCount}
          aria-label={isFa ? "صفحه بعد" : "Next page"}
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;

type PageAction = "inc" | "dec";
