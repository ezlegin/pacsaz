import { useDimensionStore } from "@repo/store/dimension.store";
import { useEffect, useState, useTransition } from "react";
import { resolveDimensions } from "../core/helpers/dimensionResolver";
import { MaterialKey, MATERIALS } from "../data/consts";
import { DielineData, DielineGeneratorProps, Model } from "../data/types";
import { DimensionType } from "../utils/applyDimensionOffset";
import { toPt } from "../utils/sizeConvertor";

export function useDielineGenerator(
  dieline: DielineGeneratorProps,
  container?: boolean
) {
  const [material, setMaterial] = useState<MaterialKey>(
    dieline.materials.default.value as MaterialKey
  );
  const [dimensionType, setDimensionType] =
    useState<DimensionType>("manufacture");
  const [bleedSize, setBleedSize] = useState<number>(dieline.defaultBleed);
  const [showAnchors, setShowAnchors] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [showOverallDimensions, setShowOverallDimensions] = useState(false);
  const [doCenterSVG, setDoCenterSVG] = useState(true);
  const [customThickness, setCustomThickness] = useState<number | undefined>();
  const { dimension, setDimension, setDefaultDimension } = useDimensionStore();

  useEffect(() => {
    setDefaultDimension(dieline.dimensions.defaultDimensions);
  }, []);

  const selectedMaterial = MATERIALS[material];

  const widthPT = toPt(dimension.width);
  const lengthPT = toPt(dimension.length);
  const heightPT = toPt(dimension.height);

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

  const dielineData: DielineData = {
    size: dimension,
    material,
    dimensionType,
    bleedSize,
    customThickness,
  };

  return {
    dielineData,
    size: dimension,
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
