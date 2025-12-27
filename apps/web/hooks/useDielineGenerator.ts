import { MaterialKey, MATERIALS } from "@/lib/dielines/core/consts";
import { DimensionType } from "@/lib/dielines/core/helpers/applyDimensionOffset";
import { resolveDimensions } from "@/lib/dielines/core/helpers/dimensionResolver";
import { DielineGenerator, Model } from "@/lib/dielines/core/types";
import { toPt } from "@/utils/sizeConvertor";
import { useState, useTransition, useEffect } from "react";
import { useSize } from "./useSize";

export function useDielineGenerator(dieline: DielineGenerator) {
  const [material, setMaterial] = useState<MaterialKey>(
    dieline.materials.default.value as MaterialKey
  );
  const [dimensionType, setDimensionType] =
    useState<DimensionType>("manufacture");
  const [bleedSize, setBleedSize] = useState<number | undefined>();
  const [showAnchors, setShowAnchors] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [showOverallDimensions, setShowOverallDimensions] = useState(false);

  const { size, setDimension } = useSize(dieline.dimensions);
  const [customThickness, setCustomThickness] = useState<number | undefined>();

  const selectedMaterial = MATERIALS[material];

  const widthPT = toPt(size.width);
  const lengthPT = toPt(size.length);
  const heightPT = toPt(size.height);

  const resolved = resolveDimensions({
    width: widthPT,
    length: lengthPT,
    height: heightPT,
    dimensionType,
    material: selectedMaterial,
    customThickness,
  });

  const [svg, setSvg] = useState<Model | null>(null);
  const [isRendering, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      const result = dieline.model({
        dimensions: {
          bleedSize,
          raw: { width: widthPT, height: heightPT, length: lengthPT },
          resolved,
        },
        developers: { showAnchors, showWatermark, showOverallDimensions },
        dimensionType,
        selectedMaterial: material,
      });

      setSvg(result);
    });
  }, [
    widthPT,
    lengthPT,
    heightPT,
    dimensionType,
    material,
    showAnchors,
    showWatermark,
    showOverallDimensions,
    bleedSize,
    customThickness,
    dieline,
  ]);

  return {
    size,
    svg,
    isRendering,
    material,
    dimensionType,
    bleedSize,
    showAnchors,
    showWatermark,
    showOverallDimensions,
    setDimension,
    setMaterial,
    setDimensionType,
    setBleedSize,
    setShowAnchors,
    setShowWatermark,
    setCustomThickness,
    setShowOverallDimensions,
  };
}
