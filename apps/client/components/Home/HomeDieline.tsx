"use client";

import { DIMENSIONS } from "@/data/consts";
import { tuckEnd } from "@/public";
import { Dieline } from "@repo/db";
import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import { Dimension } from "@repo/store/data/types";
import { useDeveloperToolsStore } from "@repo/store/dieline/developerTools.store";
import { Card as ShadCard } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect } from "react";
import DielineLoadingOverlay from "../product/DielineLoadingOverlay";
import { DimensionInput } from "../product/DimensionsInput";
const SVGPreview = dynamic(
  () => import("@repo/ui/components/custom/SVGPreview"),
  {
    ssr: false,
  },
);

type DielineSettings = {
  bleed: number;
  defaultDimension: Dimension;
  minDimension: Dimension;
  materials: string;
  dimensionTypes: string;
};

const HomeDieline = ({
  dieline,
}: {
  dieline: (Dieline & { settings: DielineSettings }) | null;
}) => {
  const containerClass = "h-175 max-w-225 min-w-225";
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

  dieline.settings.defaultDimension.width = 80;
  dieline.settings.defaultDimension.length = 130;
  dieline.settings.defaultDimension.height = 40;
  const specs = JSON.parse(dieline.specification);
  const { isRendering } = useDielineGenerator(
    { specification: specs, settings: dieline.settings },
    "client",
  );
  const { setDeveloperTools: setDeveloperToolsCTX } = useDeveloperToolsStore();

  useEffect(() => {
    setDeveloperToolsCTX("showWatermark", false);
    setDeveloperToolsCTX("showContainer", false);
    setDeveloperToolsCTX("doCenterSVG", true);
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

      <ShadCard className="gap-3 max-w-40 absolute right-0 bottom-0 bg-background p-3">
        {DIMENSIONS.map(({ key, label }) => (
          <DimensionInput
            key={key}
            label={label}
            min={dieline.settings.minDimension[key]}
            dimKey={key}
            isRendering={isRendering}
          />
        ))}
      </ShadCard>
    </div>
  );
};

export default HomeDieline;
