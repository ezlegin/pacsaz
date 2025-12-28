"use client";

import ProductDetails from "@/components/product/ProductDetails";
import SVGPreview from "@/components/product/SVGPreview";
import { useDielineGenerator } from "@/hooks/useDielineGenerator";
import { DielineGenerator } from "@/lib/dielines/core/types";
import { dielines, DielineSlug } from "@/lib/dielines/registery";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Spinner } from "@workspace/ui/components/spinner";
import ProductInfo from "./ProductInfo";

interface Props {
  slug: string;
}

export default function DielineGenerator({ slug }: Props) {
  const dieline = dielines[slug as DielineSlug] as DielineGenerator;

  const {
    size,
    svg,
    isRendering,
    material,
    dimensionType,
    showWatermark,
    setShowOverallDimensions,
    setDimension,
    setMaterial,
    setDimensionType,
    setBleedSize,
    setShowAnchors,
    setShowWatermark,
    setCustomThickness,
    showOverallDimensions,
  } = useDielineGenerator(dieline);

  return (
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

      <Dialog open={isRendering && !svg}>
        <DialogContent
          showCloseButton={false}
          overlayClassname="backdrop-blur-[5px] bg-accent/10 "
          className="p-3 px-4 w-fit"
        >
          <DialogTitle className="sr-only" />
          <DialogDescription className="flex items-center gap-2">
            <Spinner />
            در حال تولید...
          </DialogDescription>
        </DialogContent>
      </Dialog>

      {svg && <SVGPreview svg={svg.model} isRendering={isRendering} />}

      <ProductInfo
        dimension={size}
        dimensionType={dimensionType}
        dimensionsType={dieline.dimensionsType}
        sizes={svg?.sizes}
        slug={dieline.slug}
        setShowAnchors={setShowAnchors}
        setShowWatermark={setShowWatermark}
        showWatermark={showWatermark}
        showOverallDimensions={showOverallDimensions}
        setShowOverallDimensions={setShowOverallDimensions}
      />
    </div>
  );
}
