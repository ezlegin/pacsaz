"use client";

import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import { dielineImporter } from "@repo/dieline-core/utils/dielineImporter";
import { Card as ShadCard } from "@repo/ui/components/card";
import { DIMENSIONS } from "../../../../packages/dieline-core/src/data/consts";
import { DimensionInput } from "../product/DimensionsInput";
import SVGPreview from "../product/SVGPreview";
import ProductLoadingOverlay from "../product/ProductLoadingOverlay";

const HomeSVGModel = () => {
  const dieline = dielineImporter("home-dieline");

  if (!dieline) return;

  dieline.dimensions.defaultDimensions.width = 80;
  dieline.dimensions.defaultDimensions.length = 130;
  dieline.dimensions.defaultDimensions.height = 40;
  dieline.dimensions.minDimensions.height = 30;
  const { isRendering, doCenterSVG } = useDielineGenerator(dieline, false);

  return (
    <div className="relative p-0">
      <ProductLoadingOverlay />

      <div className="h-175 max-w-225 min-w-225">
        <SVGPreview
          isRendering={isRendering}
          doCenterSVG={doCenterSVG}
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
            min={dieline.dimensions.minDimensions[key]}
            dimKey={key}
            isRendering={isRendering}
          />
        ))}
      </ShadCard>
    </div>
  );
};

export default HomeSVGModel;
