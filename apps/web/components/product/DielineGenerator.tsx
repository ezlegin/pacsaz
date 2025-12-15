"use client";

import ProductDetails from "@/components/product/ProductDetails";
import ProductInfo from "@/components/product/ProductInfo";
import SVGPreview from "@/components/product/SVGPreview";
import { useSize } from "@/hooks/useSize";
import { DielineDefinition } from "@/lib/dielines/core/types";
import { dielines, DielineSlug } from "@/lib/dielines/registery";

interface Props {
  slug: string;
}

export default function DielineGenerator({ slug }: Props) {
  const dieline = dielines[slug as DielineSlug] as DielineDefinition;

  const { size, setDimension } = useSize(dieline.dimensions);

  const svg = dieline.model(size);

  return (
    <div className="h-full relative gap-6">
      <ProductDetails
        dimensions={dieline.dimensions}
        dimensionsType={dieline.dimensionsType}
        setDimension={setDimension}
      />

      <SVGPreview svg={svg} />

      <ProductInfo dimension={size} dimensionsType={dieline.dimensionsType} />
    </div>
  );
}
