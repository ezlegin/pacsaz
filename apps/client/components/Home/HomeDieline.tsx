"use client";

import { DIMENSIONS } from "@/data/consts";
import { DielineType } from "@/data/types";
import { tuckEnd } from "@/public";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { setDeveloperTool } from "@repo/store/slices/developerToolsSlice";
import { Card } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect } from "react";
import DielineLoadingOverlay from "../product/DielineLoadingOverlay";
import { DimensionInput } from "../product/DimensionsInput";
import { useEngineDieline } from "../product/useEngineDieline";
const SVGPreview = dynamic(
  () => import("@repo/ui/components/custom/SVGPreview"),
  {
    ssr: false,
  },
);

const containerClass = "h-175 max-w-225 min-w-225";

const HomeDieline = ({ dieline }: { dieline: DielineType | null }) => {
  if (!dieline)
    return (
      <div className={cn(containerClass, "flex justify-center items-center")}>
        <Image
          alt="dieline"
          src={tuckEnd}
          width={800}
          height={800}
          className="h-full w-auto"
        />
      </div>
    );
  return <LiveDieline dieline={dieline} />;
};

/** Hooks need a component of their own: the fallback above returns before them. */
const LiveDieline = ({ dieline }: { dieline: DielineType }) => {
  const { minDimension, maxDimension } = useAppSelector(
    (s) => s.dielineSettings,
  );

  const { isRendering } = useEngineDieline(dieline, { watermark: false });
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setDeveloperTool({ key: "showContainer", value: false }));
    dispatch(setDeveloperTool({ key: "showWatermark", value: false }));
    dispatch(setDeveloperTool({ key: "doCenterSVG", value: true }));
  }, [dispatch]);

  return (
    <div className="relative p-0">
      <DielineLoadingOverlay />

      <div className={containerClass}>
        <SVGPreview
          isRendering={isRendering}
          showControls={false}
          disablePanning
          disableWheel
          type="client"
        />
      </div>

      <Card className="gap-3 max-w-40 absolute right-0 bottom-0 bg-background p-3">
        {DIMENSIONS.map(({ key, label }) => (
          <DimensionInput
            key={key}
            label={label}
            min={minDimension[key]}
            max={maxDimension[key]}
            dimKey={key}
            isRendering={isRendering}
          />
        ))}
      </Card>
    </div>
  );
};

export default HomeDieline;
