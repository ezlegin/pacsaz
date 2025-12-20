"use client";

import ProductDetails from "@/components/product/ProductDetails";
import SVGPreview from "@/components/product/SVGPreview";
import { useSize } from "@/hooks/useSize";
import { MaterialKey, MATERIALS } from "@/lib/dielines/core/consts";
import { DimensionType } from "@/lib/dielines/core/helpers/applyDimensionOffset";
import { resolveDimensions } from "@/lib/dielines/core/helpers/dimensionResolver";
import { DielineDefinition, Model } from "@/lib/dielines/core/types";
import { dielines, DielineSlug } from "@/lib/dielines/registery";
import { toPt } from "@/utils/sizeConvertor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Spinner } from "@workspace/ui/components/spinner";
import { useEffect, useState, useTransition } from "react";
import ProductInfo from "./ProductInfo";

interface Props {
  slug: string;
}

export default function DielineGenerator({ slug }: Props) {
  const dieline = dielines[slug as DielineSlug] as DielineDefinition;

  const [material, setMaterial] = useState<MaterialKey>(
    dieline.materials.default.value as MaterialKey
  );
  const [showAnchors, setShowAnchors] = useState<boolean>(false);

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

  const [svg, setSvg] = useState<Model | null>(null);
  const [isRendering, startTransition] = useTransition();

  // useEffect(() => {
  //   let cancelled = false;

  //   // 1️⃣ Immediately show loading
  //   setSvg(null);
  //   // setLoadedCount((pre) => (pre += 1));

  //   // 2️⃣ Yield to browser (allow paint)
  //   const frameId = requestAnimationFrame(() => {
  //     // 3️⃣ Artificial delay
  //     const timeoutId = setTimeout(() => {
  //       if (cancelled) return;

  //       const result = dieline.model({
  //         dimensions: {
  //           raw: {
  //             width: widthPT,
  //             height: heightPT,
  //             length: lengthPT,
  //           },
  //           resolved: { width, length, height, offsets },
  //         },
  //         developers: { showAnchors },
  //         dimensionType,
  //         selectedMaterial: material,
  //       });

  //       setSvg(result);
  //     }, 1000); // ⏳ REAL delay you can see

  //     return () => clearTimeout(timeoutId);
  //   });

  //   return () => {
  //     cancelled = true;
  //     cancelAnimationFrame(frameId);
  //   };
  // }, [widthPT, lengthPT, heightPT, dimensionType, material, showAnchors]);

  useEffect(() => {
    startTransition(() => {
      const result = dieline.model({
        dimensions: {
          raw: {
            width: widthPT,
            height: heightPT,
            length: lengthPT,
          },
          resolved: { width, length, height, offsets },
        },
        developers: {
          showAnchors,
        },
        dimensionType,
        selectedMaterial: material,
      });

      setSvg(result);
    });
  }, [widthPT, lengthPT, heightPT, dimensionType, material, showAnchors]);

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

      {svg && (
        <SVGPreview
          svg={svg.model}
          initalScale={dieline.dimensions.initialScale}
          isRendering={isRendering}
        />
      )}

      <ProductInfo
        dimension={size}
        dimensionType={dimensionType}
        dimensionsType={dieline.dimensionsType}
        sizes={svg?.sizes}
        slug={dieline.slug}
        setShowAnchors={setShowAnchors}
      />
    </div>
  );
}
