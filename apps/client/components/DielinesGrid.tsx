"use client";

import { placeholder } from "@/public";
import { User } from "@repo/db";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowUpRight,
  Box,
  LayoutGrid,
  Ratio,
  SearchX,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import DielineFavoriteButton from "./DielineFavoriteButton";

type ImageType = "model" | "dieline";

export type DielineCardData = {
  id: number;
  title: string;
  slug: string;
  dielineImage: { url: string } | null;
  modelImage: { url: string } | null;
  categoryByModel?: { id: number; title: string }[];
  categoryByUsage?: { id: number; title: string }[];
};

const DielinesGrid = ({
  dielines,
  favedIds = [],
  user = null,
  emptyState,
}: {
  dielines: DielineCardData[];
  /** Dieline ids the current user has favourited. */
  favedIds?: number[];
  user?: User | null;
  emptyState?: React.ReactNode;
}) => {
  const [imageType, setImageType] = useState<ImageType>("dieline");
  const faved = new Set(favedIds);

  if (dielines.length === 0) {
    return (
      <>
        {emptyState ?? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed px-6 py-20 text-center">
            <span className="grid size-14 place-items-center rounded-3xl bg-primary/10 text-primary">
              <SearchX className="size-6" strokeWidth={1.7} />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-bold">قالبی پیدا نشد</p>
              <p className="text-xs text-muted-foreground">
                فیلتر دیگری را امتحان کن یا دسته‌بندی را حذف کن.
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="space-y-5">
      {/* ----------------------------- view toggle ---------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <LayoutGrid className="size-3.5 text-primary" />
          {dielines.length.toLocaleString("fa-IR", { useGrouping: false })} قالب
          نمایش داده می‌شود
        </div>

        <div className="flex items-center gap-1 rounded-2xl border bg-muted/50 p-1">
          {(
            [
              { value: "dieline", label: "دایلاین", icon: Ratio },
              { value: "model", label: "مدل", icon: Box },
            ] as const
          ).map(({ value, label, icon: Icon }) => {
            const active = imageType === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setImageType(value)}
                aria-pressed={active}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all duration-300",
                  active
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* -------------------------------- grid -------------------------------- */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {dielines.map((dieline) => (
          <DielineCard
            key={dieline.id}
            dieline={dieline}
            imageType={imageType}
            user={user}
            faved={faved.has(dieline.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default DielinesGrid;

const DielineCard = ({
  imageType,
  dieline,
  user,
  faved,
}: {
  imageType: ImageType;
  dieline: DielineCardData;
  user: User | null;
  faved: boolean;
}) => {
  const categories = [
    ...(dieline.categoryByModel ?? []),
    ...(dieline.categoryByUsage ?? []),
  ].slice(0, 2);

  const modelSrc = dieline.modelImage?.url ?? placeholder;
  const dielineSrc = dieline.dielineImage?.url ?? placeholder;

  return (
    <div className="group relative">
      {/*
        Same tab, deliberately: this is the site's primary internal link to a
        product page, and `target="_blank"` makes it a dead end for the crawler
        that follows it.
      */}
      <Link href={`/dieline/${dieline.slug}`} className="block space-y-3">
        {/* ----------------------------- preview ---------------------------- */}
        <div className="relative overflow-hidden rounded-2xl border bg-muted/30 transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-xl group-hover:shadow-primary/10">
          {/* the non-active layer stays in flow so the box never collapses */}
          <Image
            alt={dieline.title}
            src={imageType === "dieline" ? dielineSrc : modelSrc}
            width={500}
            height={500}
            className="aspect-square w-full object-cover"
          />

          <Image
            alt=""
            aria-hidden
            src={imageType === "dieline" ? modelSrc : dielineSrc}
            width={500}
            height={500}
            className={cn(
              "absolute inset-0 aspect-square w-full object-cover opacity-0 transition-opacity duration-300",
              "group-hover:opacity-100",
            )}
          />

          {/* hover hint */}
          <span className="pointer-events-none absolute bottom-3 left-3 inline-flex translate-y-1 items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-bold text-primary opacity-0 shadow-sm backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {imageType === "dieline" ? "نمایش مدل" : "نمایش دایلاین"}
            <ArrowUpRight className="size-3" />
          </span>
        </div>

        {/* ------------------------------ caption ---------------------------- */}
        <div className="space-y-2 px-0.5">
          <h3 className="truncate text-sm font-bold transition-colors group-hover:text-primary">
            {dieline.title}
          </h3>

          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((category) => (
                <span
                  key={category.id}
                  className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {category.title}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* favourite sits outside the link so nesting stays valid */}
      <DielineFavoriteButton
        dielineId={dieline.id}
        initialFaved={faved}
        user={user}
        className="absolute right-3 top-3"
      />
    </div>
  );
};
