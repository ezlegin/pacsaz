import { MaterialKey, MATERIALS } from "../core/consts";
import { resolveDimensions } from "../core/helpers/dimensionResolver";
import { DielineGeneratorProps, Model } from "../core/types";
import { useEffect, useState, useTransition } from "react";
import { useSize } from "./useSize";
import { toPt } from "../utils/sizeConvertor";
import { DimensionType } from "../utils/applyDimensionOffset";

export function useDielineGenerator(
  dieline: DielineGeneratorProps,
  container?: boolean
) {
  const [material, setMaterial] = useState<MaterialKey>(
    dieline.materials.default.value as MaterialKey
  );
  const [dimensionType, setDimensionType] =
    useState<DimensionType>("manufacture");
  const [bleedSize, setBleedSize] = useState<number | undefined>();
  const [showAnchors, setShowAnchors] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [showOverallDimensions, setShowOverallDimensions] = useState(false);
  const [doCenterSVG, setDoCenterSVG] = useState(true);
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
          container: container ?? true,
          customThickness,
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
    resolved,
    svg,
    isRendering,
    material,
    dimensionType,
    bleedSize,
    showAnchors,
    showWatermark,
    showOverallDimensions,
    doCenterSVG,
    setDimension,
    setMaterial,
    setDimensionType,
    setBleedSize,
    setShowAnchors,
    setShowWatermark,
    setCustomThickness,
    setShowOverallDimensions,
    setDoCenterSVG,
  };
}
