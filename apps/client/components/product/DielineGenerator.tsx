"use client";

import { DielineType } from "@/data/types";
import { CustomDielineSettings } from "@repo/db";
import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { setDeveloperTool } from "@repo/store/slices/developerToolsSlice";
import { ISpec, IVar } from "@repo/store/types";
import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";
import { UserType } from "./DielineDownloadButton";
import DielineLoadingOverlay from "./DielineLoadingOverlay";
import DielineSettings from "./DielineSettings";
import ProductInfo from "./ProductInfo";
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

  const specs = useMemo(
    () => JSON.parse(dieline.specification) as ISpec.Specs,
    [dieline.specification],
  );
  const variables = useMemo(
    () => JSON.parse(dieline.variable) as IVar.VariableMap,
    [dieline.variable],
  );

  const { isRendering } = useDielineGenerator(
    {
      ...dieline,
      specification: specs,
      settings: dieline.settings,
      customSettings,
      variables,
    },
    user,
  );

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
      />

      {/*
        The canvas sits directly on the page background — no card wrapper, so the
        dieline reads as the workspace itself. The absolute centring wrapper is
        kept as-is: SVGPreview measures against this geometry.
      */}
      <div className="relative min-h-0">
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
      </div>

      {/* -------------------------------- details ------------------------------ */}
      <ProductInfo isRendering={isRendering} />
    </div>
  );
};

export default DielineGenerator;
