"use client";

import { Button } from "@repo/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  pageSize: number;
  totalItems: number;
  paramName?: string;
  lang?: "fa" | "en";
}

const Pagination = ({
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

  return (
    <div
      dir={lang === "en" ? "ltr" : "rtl"}
      className="text-sm flex items-center"
    >
      <PageButton
        pageAction="dec"
        pageHandler={pageHandler}
        chevron="right"
        currentPage={currentPage}
      />

      <span className="text-gray-500 mx-2">
        {lang === "fa" ? (
          <span>
            صفحه {currentPage} از {pageCount}
          </span>
        ) : (
          <span dir="ltr">
            Page {currentPage} of {pageCount}
          </span>
        )}
      </span>

      <PageButton
        pageAction="inc"
        pageHandler={pageHandler}
        chevron="left"
        currentPage={currentPage}
        pageCount={pageCount}
      />
    </div>
  );
};

export default Pagination;

type PageAction = "inc" | "dec";

function PageButton({
  currentPage,
  pageHandler,
  chevron,
  pageAction,
  pageCount,
}: {
  currentPage: number;
  chevron: "left" | "right";
  pageAction: PageAction;
  pageHandler: (pageAction: PageAction) => void;
  pageCount?: number;
}) {
  return (
    <Button
      size={"icon"}
      variant={"ghost"}
      onClick={() => pageHandler(pageAction)}
      disabled={
        pageAction === "inc" ? currentPage === pageCount : currentPage <= 1
      }
    >
      {chevron === "left" ? <ChevronLeft /> : <ChevronRight />}
    </Button>
  );
}
