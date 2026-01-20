"use client";

import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import { dielineImporter } from "@repo/dieline-core/utils/dielineImporter";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingOverlay from "./LoadingOverlay";
import ProductDetails from "./ProductDetails";
import ProductInfo from "./ProductInfo";
import SVGPreview from "./SVGPreview";

const DielineGenerator = ({ slug }: { slug: string }) => {
  const dieline = dielineImporter(slug);

  if (!dieline) return notFound();

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
    resolved,
    setShowOverallDimensions,
    setDimension,
    setMaterial,
    setDimensionType,
    setBleedSize,
    setShowAnchors,
    setShowWatermark,
    setCustomThickness,
    setDoCenterSVG,
    dielineData,
  } = useDielineGenerator(dieline);

  const [isRenderingLoading, setIsRenderingLoading] = useState(true);
  useEffect(() => {
    if (svg) setIsRenderingLoading(false);
  }, [svg]);

  return (
    <div className="h-full">
      <LoadingOverlay isLoading={isRenderingLoading} />

      <div className="h-full grid grid-cols-[320px_1fr_300px] p-3">
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
          resolvedSizes={resolved}
          dimension={size}
          dielineData={dielineData}
        />

        <div className="relative">
          <div className="absolute top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2 h-full w-full pb-10">
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
    </div>
  );
};

export default DielineGenerator;
