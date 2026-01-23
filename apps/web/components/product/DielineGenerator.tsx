"use client";

import { useDielineGenerator } from "@repo/dieline-core/hooks/useDielineGenerator";
import { dielineImporter } from "@repo/dieline-core/utils/dielineImporter";
import { notFound } from "next/navigation";
import ProductDetails from "./ProductDetails";
import ProductInfo from "./ProductInfo";
import ProductLoadingOverlay from "./ProductLoadingOverlay";
import SVGPreview from "./SVGPreview";

const DielineGenerator = ({ slug }: { slug: string }) => {
  const dieline = dielineImporter(slug);

  if (!dieline) return notFound();

  const {
    isRendering,
    showWatermark,
    doCenterSVG,
    showAnchors,
    showOverallDimensions,
    resolved,
    setShowOverallDimensions,
    setShowAnchors,
    setShowWatermark,
    setDoCenterSVG,
  } = useDielineGenerator(dieline);

  return (
    <div className="h-full">
      <ProductLoadingOverlay />

      <div className="h-full grid grid-cols-[320px_1fr_300px] p-3">
        <ProductDetails
          defaultDimensions={dieline.dimensions}
          dimensionsType={dieline.dimensionsType}
          slug={dieline.slug}
          materialsInput={dieline.materials}
          isRendering={isRendering}
          resolvedSizes={resolved}
        />

        <div className="relative">
          <div className="absolute top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2 h-full w-full pb-10">
            <SVGPreview isRendering={isRendering} doCenterSVG={doCenterSVG} />
          </div>
        </div>

        <ProductInfo
          dimensionsType={dieline.dimensionsType}
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
