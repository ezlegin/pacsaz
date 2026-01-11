"use client";

import { DIMENSIONS } from "@repo/dieline-core/consts";
import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import { dielineImporter } from "@repo/dieline-core/utils/dielineImporter";
import { Card as ShadCard } from "@repo/ui/components/card";
import { DimensionInput } from "../product/DimensionsInput";
import SVGPreview from "../product/SVGPreview";

const HomeSVGModel = () => {
  const dieline = dielineImporter("home-dieline");

  if (!dieline) return;

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
