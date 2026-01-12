"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  pageSize: number;
  totalItems: number;
  paramName?: string;
  dir?: "rtl" | "ltr";
}

const Pagination = ({
  pageSize,
  totalItems,
  paramName,
  dir = "ltr",
}: Props) => {
  const pageCount = Math.ceil(totalItems / pageSize);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");

  const changePage = (page: number) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set(paramName ?? "page", page.toString());

    router.push(`?${params.toString()}`);
  };

  if (pageCount < 2) return null;

  const isRTL = dir === "rtl";

  return (
    <div dir={dir} className="text-sm flex items-center">
      <Button
        size={"icon"}
        variant={"ghost"}
        onClick={() => changePage(currentPage + 1)}
        disabled={currentPage === pageCount}
      >
        {isRTL ? <ChevronRight /> : <ChevronLeft />}
      </Button>

      <span className="text-gray-500 mx-2">
        {isRTL ? "صفحه" : "Page"} {currentPage} / {pageCount}
      </span>

      <Button
        size={"icon"}
        variant={"ghost"}
        onClick={() => changePage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {isRTL ? <ChevronLeft /> : <ChevronRight />}
      </Button>
    </div>
  );
};

export default Pagination;
