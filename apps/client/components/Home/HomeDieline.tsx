"use client";

import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import { dielineImporter } from "@repo/dieline-core/utils/dielineImporter";
import { Card as ShadCard } from "@repo/ui/components/card";
import { DimensionInput } from "../product/DimensionsInput";
import DielineLoadingOverlay from "../product/DielineLoadingOverlay";
import { useEffect } from "react";
import { useDeveloperToolsStore } from "@repo/store/dieline/developerTools.store";
import { DIMENSIONS } from "@/data/consts";
import dynamic from "next/dynamic";
const SVGPreview = dynamic(() => import("../product/SVGPreview"), {
  ssr: false,
});

const HomeDieline = () => {
  const dieline = dielineImporter("tuck-end");

  if (!dieline) return;

  dieline.defaultDimensions.width = 80;
  dieline.defaultDimensions.length = 130;
  dieline.defaultDimensions.height = 40;
  const { isRendering } = useDielineGenerator(dieline);
  const { setDeveloperToolsCTX } = useDeveloperToolsStore();

  useEffect(() => {
    setDeveloperToolsCTX("showWatermark", false);
    setDeveloperToolsCTX("showContainer", false);
    setDeveloperToolsCTX("doCenterSVG", true);
  }, []);

  return (
    <div className="relative p-0">
      <DielineLoadingOverlay />

      <div className="h-175 max-w-225 min-w-225">
        <SVGPreview
          isRendering={isRendering}
          showControls={false}
          disablePanning
          disableWheel
        />
      </div>

      <ShadCard className="gap-3 max-w-40 absolute right-0 bottom-0 bg-background p-3">
        {DIMENSIONS.map(({ key, label }) => (
          <DimensionInput
            key={key}
            label={label}
            min={dieline.minDimensions[key]}
            dimKey={key}
            isRendering={isRendering}
          />
        ))}
      </ShadCard>
    </div>
  );
};

export default HomeDieline;
