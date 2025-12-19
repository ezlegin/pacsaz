"use client";

import ProductDetails from "@/components/product/ProductDetails";
import ProductInfo from "@/components/product/ProductInfo";
import SVGPreview from "@/components/product/SVGPreview";
import { useSize } from "@/hooks/useSize";
import { MaterialKey, MATERIALS } from "@/lib/dielines/core/consts";
import { DimensionType } from "@/lib/dielines/core/helpers/applyDimensionOffset";
import { resolveDimensions } from "@/lib/dielines/core/helpers/dimensionResolver";
import { DielineDefinition } from "@/lib/dielines/core/types";
import { dielines, DielineSlug } from "@/lib/dielines/registery";
import { toPt } from "@/utils/sizeConvertor";
import { useState } from "react";

interface Props {
  slug: string;
}

export default function DielineGenerator({ slug }: Props) {
  const dieline = dielines[slug as DielineSlug] as DielineDefinition;

  const [material, setMaterial] = useState<MaterialKey>(
    dieline.materials.default.value as MaterialKey
  );

  const { size, setDimension } = useSize(dieline.dimensions);
  const [dimensionType, setDimensionType] =
    useState<DimensionType>("manufacture");

  const selectedMaterial = MATERIALS[material];

  const widthPT = toPt(size.width);
  const lengthPT = toPt(size.length);
  const heightPT = toPt(size.height);

  const { width, length, height, offsets } = resolveDimensions({
    width: widthPT,
    length: lengthPT,
    height: heightPT,
    dimensionType,
    material: selectedMaterial,
  });

  const svg = dieline.model({
    dimensions: {
      raw: {
        width: widthPT,
        height: heightPT,
        length: lengthPT,
      },
      resolved: { width, length, height, offsets },
    },
    dimensionType,
    selectedMaterial: material,
  });

  return (
    <div className="h-full relative gap-6">
      <ProductDetails
        defaultDimensions={dieline.dimensions}
        dimensionsType={dieline.dimensionsType}
        setDimension={setDimension}
        setMaterial={setMaterial}
        setDimensionType={setDimensionType}
        svg={svg}
        dimensionType={dimensionType}
        slug={dieline.slug}
        materials={dieline.materials}
        material={material}
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
