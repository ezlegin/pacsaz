"use client";

import { DielineType } from "@/data/types";
import { CustomDielineSettings } from "@repo/db";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { setDeveloperTool } from "@repo/store/slices/developerToolsSlice";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { UserType } from "./DielineDownloadButton";
import DielineLoadingOverlay from "./DielineLoadingOverlay";
import DielineSettings from "./DielineSettings";
import ProductInfo from "./ProductInfo";
import { useEngineDieline } from "./useEngineDieline";
import { customizeOptions } from "@repo/dieline-engine";
import { canCustomize } from "@/lib/dieline/access";
import Diamond from "@/public/icons/Diamond";
import { PencilRuler } from "lucide-react";
import Link from "next/link";
const SVGPreview = dynamic(
  () => import("@repo/ui/components/custom/SVGPreview"),
  { ssr: false },
);

const DielineGenerator = ({
  dieline,
  customSettings,
  user,
}: {
  user: UserType | null;
  dieline: DielineType;
  customSettings?: CustomDielineSettings | null;
}) => {
  const dispatch = useAppDispatch();

  const { isRendering, template, problems } = useEngineDieline(
    { ...dieline, customSettings },
    { watermark: !user },
  );

  const customizable = !!template && customizeOptions(template).any;

  const { length, width, height } = useAppSelector(
    (s) => s.dielineSettings.dimension.raw,
  );

  useEffect(() => {
    dispatch(setDeveloperTool({ key: "showContainer", value: true }));
    // this is because: if the user comes dierectly from home screen, doesn't get container.
  }, [dispatch]);

  return (
    <div className="relative grid h-full min-h-0 grid-cols-[320px_1fr_290px] gap-3 p-3">
      <DielineLoadingOverlay />

      {/* ------------------------------- settings ------------------------------ */}
      <DielineSettings
        slug={dieline.slug}
        isRendering={isRendering}
        user={user}
        problems={problems}
      />

      {/*
        The canvas sits directly on the page background — no card wrapper, so the
        dieline reads as the workspace itself. The absolute centring wrapper is
        kept as-is: SVGPreview measures against this geometry.

        `data-print-hide` keeps the drawing itself off paper: Ctrl+P prints the
        page, never a printable copy of the dieline.
      */}
      <div data-print-hide className="relative min-h-0">
        <div className="absolute top-1/2 right-1/2 h-full w-full translate-y-[-50%] translate-x-1/2 pb-10">
          <SVGPreview isRendering={isRendering} type="client" />
        </div>

        {/* floating state + live dimensions, over the canvas */}
        <div className="pointer-events-none absolute right-1 top-1 z-10 flex items-center gap-2">
          <span className="flex items-center gap-2 rounded-full border bg-background/85 px-3 py-1.5 text-[11px] font-bold shadow-sm backdrop-blur">
            <span className="relative flex size-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${
                  isRendering ? "animate-ping bg-amber-500 opacity-75" : "bg-green-500 opacity-0"
                }`}
              />
              <span
                className={`relative inline-flex size-2 rounded-full ${
                  isRendering ? "bg-amber-500" : "bg-green-500"
                }`}
              />
            </span>
            {isRendering ? "در حال تولید" : "آماده"}
          </span>

          <span
            dir="ltr"
            className="rounded-full border bg-background/85 px-3 py-1.5 text-[11px] font-bold tabular-nums shadow-sm backdrop-blur"
            title="ابعاد فعلی"
          >
            {length} × {width}
            {height > 0 ? ` × ${height}` : ""} mm
          </span>
        </div>
        {/*
          The way into the editor, always in view: visitors without the plan see
          it too (with the plan badge) and land on the page that explains it.
        */}
        <div className="absolute left-1 top-1 z-10">
          {customizable ? (
            <Link
              href={`/dieline/${dieline.slug}/customize`}
              className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-background/85 px-3 py-1.5 text-[11px] font-bold text-primary shadow-sm backdrop-blur transition-colors hover:bg-primary/10"
            >
              <PencilRuler className="size-3.5" />
              شخصی‌سازی قالب
              {!canCustomize(user?.plan) && <Diamond />}
            </Link>
          ) : (
            // Nothing in this template can be customized: the same button, switched off.
            <span
              aria-disabled
              className="flex cursor-not-allowed items-center gap-1.5 rounded-full border bg-background/85 px-3 py-1.5 text-[11px] font-bold text-muted-foreground/60 shadow-sm backdrop-blur"
            >
              <PencilRuler className="size-3.5" />
              شخصی‌سازی قالب
            </span>
          )}
        </div>
      </div>

      {/* -------------------------------- details ------------------------------ */}
      <ProductInfo isRendering={isRendering} user={user} />
    </div>
  );
};

export default DielineGenerator;
