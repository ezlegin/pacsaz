"use client";

import ProductDetails from "@/components/product/ProductDetails";
import ProductInfo from "@/components/product/ProductInfo";
import SVGPreview from "@/components/product/SVGPreview";
import { useSize } from "@/hooks/useSize";
import { DimensionType } from "@/lib/dielines/core/helpers/applyDimensionOffset";
import { DielineDefinition } from "@/lib/dielines/core/types";
import { dielines, DielineSlug } from "@/lib/dielines/registery";
import { mmToPt } from "@/utils/sizeConvertor";
import { useState } from "react";

interface Props {
  slug: string;
}

export default function DielineGenerator({ slug }: Props) {
  const dieline = dielines[slug as DielineSlug] as DielineDefinition;

  const { size, setDimension } = useSize(dieline.dimensions);
  const [dimensionType, setDimensionType] =
    useState<DimensionType>("manufacture");

  const svg = dieline.model({
    dimension: {
      width: mmToPt(size.width),
      height: mmToPt(size.height),
      length: mmToPt(size.length),
    },
    dimensionType,
  });

  return (
    <div className="h-full relative gap-6">
      <ProductDetails
        defaultDimensions={dieline.dimensions}
        dimensionsType={dieline.dimensionsType}
        setDimension={setDimension}
        setDimensionType={setDimensionType}
        svg={svg}
        dimensionType={dimensionType}
        slug={dieline.slug}
        materials={dieline.materials}
      />

      <SVGPreview
        svg={svg.model}
        initalScale={dieline.dimensions.initialScale}
      />

      <ProductInfo
        offset={svg.sizes.offset}
        dimension={size}
        dimensionType={dimensionType}
        dimensionsType={dieline.dimensionsType}
      />
    </div>
  );
}
