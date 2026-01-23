import { useEffect, useState, useTransition } from "react";
import { resolveDimensions } from "../core/helpers/dimensionResolver";
import {
  DielineData,
  DielineGeneratorProps,
  MaterialKey,
  Model,
} from "../data/types";
import { useBleedStore } from "../store/bleed.store";
import { useDimensionStore } from "../store/dimension.store";
import { useDimensionTypeStore } from "../store/dimenstionType.store";
import { useMaterialStore } from "../store/material.store";
import { useThicknessStore } from "../store/thickness.store";
import { toPt } from "../utils/sizeConvertor";

export function useDielineGenerator(
  dieline: DielineGeneratorProps,
  container?: boolean
) {
  const { material, setMaterial } = useMaterialStore();
  const [showAnchors, setShowAnchors] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [showOverallDimensions, setShowOverallDimensions] = useState(false);
  const [doCenterSVG, setDoCenterSVG] = useState(true);
  const { dimension, setDefaultDimension } = useDimensionStore();
  const { bleed, setBleed } = useBleedStore();
  const { setThickness, customThickness } = useThicknessStore();
  const { dimensionType } = useDimensionTypeStore();

  useEffect(() => {
    setDefaultDimension(dieline.dimensions.defaultDimensions);
    setMaterial(dieline.materials.default.value as MaterialKey);
    setBleed(dieline.defaultBleed);
    setThickness(material.thickness);
  }, []);

  const selectedMaterial = material;

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
          bleedSize: bleed,
          raw: { width: widthPT, height: heightPT, length: lengthPT },
          resolved,
        },
        developers: { showAnchors, showWatermark, showOverallDimensions },
        dimensionType,
        selectedMaterial: material.value,
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
    bleed,
    customThickness,
    dieline,
  ]);

  const dielineData: DielineData = {
    size: dimension,
    dimensionType,
    bleedSize: bleed,
    customThickness,
  };

  return {
    dielineData,
    resolved,
    svg,
    isRendering,
    showAnchors,
    showWatermark,
    showOverallDimensions,
    doCenterSVG,
    setShowAnchors,
    setShowWatermark,
    setShowOverallDimensions,
    setDoCenterSVG,
  };
}
