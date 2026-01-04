"use client";

import { useDielineGenerator } from "@/hooks/useDielineGenerator";
import { DIMENSIONS } from "@/lib/dielines/core/consts";
import { DielineGeneratorProps } from "@/lib/dielines/core/types";
import { dielines } from "@/lib/dielines/registery";
import { Card as ShadCard } from "@workspace/ui/components/card";
import { DimensionInput } from "../product/DimensionsInput";
import SVGPreview from "../product/SVGPreview";

const HomeSVGModel = () => {
  const dieline = dielines["tuck-end"] as DielineGeneratorProps;
  dieline.dimensions.defaultDimensions.width = 80;
  dieline.dimensions.defaultDimensions.length = 130;
  dieline.dimensions.defaultDimensions.height = 40;
  dieline.dimensions.minDimensions.height = 30;
  const { svg, isRendering, doCenterSVG, setDimension } = useDielineGenerator(
    dieline,
    false
  );

  return (
    <div className="relative p-0">
      <div className="h-[700px] max-w-[900px] min-w-[900px]">
        {svg && (
          <SVGPreview
            svg={svg.model}
            isRendering={isRendering}
            doCenterSVG={doCenterSVG}
            showControls={false}
            disablePanning
            disableWheel
          />
        )}
      </div>

      <ShadCard className="gap-3 max-w-[160px] absolute right-0 bottom-0 bg-background p-3">
        {DIMENSIONS.map(({ key, label }) => (
          <DimensionInput
            key={key}
            label={label}
            value={dieline.dimensions.defaultDimensions[key]}
            min={dieline.dimensions.minDimensions[key]}
            onChange={(value) => setDimension(key, value)}
            dimKey={key}
            isRendering={isRendering}
          />
        ))}
      </ShadCard>
    </div>
  );
};

export default HomeSVGModel;
