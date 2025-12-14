"use client";

import ProductDetails, {
  DimensionKey,
} from "@/components/product/ProductDetails";
import ProductInfo from "@/components/product/ProductInfo";
import SVGPreview from "@/components/product/SVGPreview";
import { dielines, DielineSlug } from "@/lib/dielines/registery";
import { useState } from "react";

interface Props {
  slug: string;
}

export default function DielineGenerator({ slug }: Props) {
  const dieline = dielines[slug as DielineSlug];
  const [width, setWidth] = useState(dieline.defaultDimensions.width);
  const [height, setHeight] = useState(dieline.defaultDimensions.height);
  const [length, setLength] = useState(dieline.defaultDimensions.length);

  const svg = dieline.model({ width, height, length });

  const setDimension = (key: DimensionKey, value: number) => {
    if (key === "width") setWidth(value);
    if (key === "height") setHeight(value);
    if (key === "length") setLength(value);
  };

  return (
    <div className="h-full relative gap-6">
      <ProductDetails
        dimensions={{ height, width, length }}
        setDimension={setDimension}
      />

      <SVGPreview svg={svg} />

      <ProductInfo height={height} width={width} length={length} />
    </div>
  );
}
