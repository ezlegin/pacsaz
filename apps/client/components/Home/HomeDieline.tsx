"use client";

import { DIMENSIONS } from "@/data/consts";
import { DielineType } from "@/data/types";
import { tuckEnd } from "@/public";
import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { setDeveloperTool } from "@repo/store/slices/developerToolsSlice";
import { ISpec, IVar } from "@repo/store/types";
import { Card } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import DielineLoadingOverlay from "../product/DielineLoadingOverlay";
import { DimensionInput } from "../product/DimensionsInput";
const SVGPreview = dynamic(
  () => import("@repo/ui/components/custom/SVGPreview"),
  {
    ssr: false,
  },
);

const HomeDieline = ({ dieline }: { dieline: DielineType | null }) => {
  // Fluid, so the preview is usable below `xl` too: the SVG inside sizes itself
  // to this box. It used to be pinned to `min-w-225`, which is what forced the
  // hero to hide it on anything narrower than a desktop.
  const containerClass = "h-125 w-full sm:h-150 xl:h-175";
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

  const { minDimension, maxDimension } = useAppSelector(
    (s) => s.dielineSettings,
  );

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
      settings: dieline.settings!,
      variables,
    },
    "client",
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setDeveloperTool({ key: "showContainer", value: false }));
    dispatch(setDeveloperTool({ key: "showWatermark", value: false }));
    dispatch(setDeveloperTool({ key: "doCenterSVG", value: true }));
  }, []);

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
