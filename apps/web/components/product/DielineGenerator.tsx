"use client";

import ProductDetails, {
  SVGSizeProps,
} from "@/components/product/ProductDetails";
import ProductInfo from "@/components/product/ProductInfo";
import SVGPreview from "@/components/product/SVGPreview";
import { useSize } from "@/hooks/useSize";
import { mmToPt } from "@/utils/sizeConvertor";
import { DielineDefinition } from "@/lib/dielines/core/types";
import { dielines, DielineSlug } from "@/lib/dielines/registery";
import { margins } from "@/lib/dielines/core/consts";

interface Props {
  slug: string;
}

export default function DielineGenerator({ slug }: Props) {
  const dieline = dielines[slug as DielineSlug] as DielineDefinition;

  const { size, setDimension } = useSize(dieline.dimensions);

  const svg = dieline.model({
    width: mmToPt(size.width),
    height: mmToPt(size.height),
    length: mmToPt(size.length),
  });

  const svgSize: SVGSizeProps = {
    widthMM: svg.svgSize.widthMM + margins.container * 2,
    lengthMM: svg.svgSize.lengthMM + margins.container * 2,
  };

  return (
    <div className="h-full relative gap-6">
      <ProductDetails
        defaultDimensions={dieline.dimensions}
        dimensionsType={dieline.dimensionsType}
        setDimension={setDimension}
        svg={svg.svg}
        svgSize={svgSize}
        slug={dieline.slug}
      />

      <SVGPreview svg={svg.svg} initalScale={dieline.dimensions.initialScale} />

      <ProductInfo dimension={size} dimensionsType={dieline.dimensionsType} />
    </div>
  );
}
