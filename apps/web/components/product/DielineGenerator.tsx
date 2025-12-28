"use client";

import ProductDetails from "@/components/product/ProductDetails";
import SVGPreview from "@/components/product/SVGPreview";
import { useDielineGenerator } from "@/hooks/useDielineGenerator";
import { DielineGeneratorProps } from "@/lib/dielines/core/types";
import { dielines, DielineSlug } from "@/lib/dielines/registery";
import { useEffect, useState } from "react";
import LoadingOverlay from "./LoadingOverlay";
import ProductInfo from "./ProductInfo";

interface Props {
  slug: string;
}

export default function DielineGenerator({ slug }: Props) {
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
    setShowOverallDimensions,
    setDimension,
    setMaterial,
    setDimensionType,
    setBleedSize,
    setShowAnchors,
    setShowWatermark,
    setCustomThickness,
    setDoCenterSVG,
    showOverallDimensions,
  } = useDielineGenerator(dieline);

  const [isRenderingLoading, setIsRenderingLoading] = useState(true);
  useEffect(() => {
    if (svg) setIsRenderingLoading(false);
  }, [svg]);

  return (
    <>
      <LoadingOverlay isLoading={isRenderingLoading} />

      <div className="h-full relative gap-6">
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

        {svg && (
          <SVGPreview
            svg={svg.model}
            isRendering={isRendering}
            doCenterSVG={doCenterSVG}
          />
        )}

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
    </>
  );
}
