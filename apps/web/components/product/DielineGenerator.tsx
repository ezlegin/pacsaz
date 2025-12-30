"use client";

import { useDielineGenerator } from "@/hooks/useDielineGenerator";
import { DielineGeneratorProps } from "@/lib/dielines/core/types";
import { dielines, DielineSlug } from "@/lib/dielines/registery";
import { useEffect, useState } from "react";
import LoadingOverlay from "./LoadingOverlay";
import ProductDetails from "./ProductDetails";
import ProductInfo from "./ProductInfo";
import SVGPreview from "./SVGPreview";

const DielineGenerator = ({ slug }: { slug: string }) => {
  const dieline = dielines[slug as DielineSlug] as DielineGeneratorProps;

  const {
    size,
    svg,
    isRendering,
    material,
    dimensionType,
    showWatermark,
    doCenterSVG,
    showAnchors,
    showOverallDimensions,
    setShowOverallDimensions,
    setDimension,
    setMaterial,
    setDimensionType,
    setBleedSize,
    setShowAnchors,
    setShowWatermark,
    setCustomThickness,
    setDoCenterSVG,
  } = useDielineGenerator(dieline);

  const [isRenderingLoading, setIsRenderingLoading] = useState(true);
  useEffect(() => {
    if (svg) setIsRenderingLoading(false);
  }, [svg]);

  return (
    <div className="h-full grid grid-cols-[320px_1fr_320px] p-3">
      <LoadingOverlay isLoading={isRenderingLoading} />

      <ProductDetails
        defaultDimensions={dieline.dimensions}
        dimensionsType={dieline.dimensionsType}
        setDimension={setDimension}
        setMaterial={setMaterial}
        setDimensionType={setDimensionType}
        setBleedAmount={setBleedSize}
        setCustomThickness={setCustomThickness}
        svg={svg}
        dimensionType={dimensionType}
        slug={dieline.slug}
        materials={dieline.materials}
        material={material}
        isRendering={isRendering}
      />

      <div className="relative">
        <div className="absolute top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2 h-full w-full pb-16">
          {svg && (
            <SVGPreview
              svg={svg.model}
              isRendering={isRendering}
              doCenterSVG={doCenterSVG}
            />
          )}
        </div>
      </div>

      <ProductInfo
        dimension={size}
        dimensionType={dimensionType}
        dimensionsType={dieline.dimensionsType}
        sizes={svg?.sizes}
        slug={dieline.slug}
        showAnchors={showAnchors}
        showWatermark={showWatermark}
        showOverallDimensions={showOverallDimensions}
        doCenterSVG={doCenterSVG}
        setShowAnchors={setShowAnchors}
        setShowWatermark={setShowWatermark}
        setShowOverallDimensions={setShowOverallDimensions}
        setDoCenterSVG={setDoCenterSVG}
      />
    </div>
  );
};

export default DielineGenerator;
