"use client";

import { useDielineGenerator } from "@/hooks/useDielineGenerator";
import { DielineGeneratorProps } from "@/lib/dielines/core/types";
import { dielines, DielineSlug } from "@/lib/dielines/registery";
import { useEffect, useRef, useState } from "react";
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

  const detailsRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const detailsWidth = detailsRef.current?.clientWidth ?? 0;
  const infoWidth = infoRef.current?.clientWidth ?? 0;

  const sidebarsTotalWidth = detailsWidth + infoWidth;

  return (
    <div className="h-full relative">
      <LoadingOverlay isLoading={isRenderingLoading} />

      <div className="absolute right-0 top-0 h-full z-10" ref={detailsRef}>
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
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-full flex justify-center items-center w-full">
        {svg && (
          <SVGPreview
            sidebarsTotalWidth={sidebarsTotalWidth}
            svg={svg.model}
            isRendering={isRendering}
            doCenterSVG={doCenterSVG}
          />
        )}
      </div>

      <div className="absolute left-0 top-0 h-full z-10" ref={infoRef}>
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
