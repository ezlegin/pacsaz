import { useBleedStore } from "@repo/store/dieline/bleed.store";
import { useDimensionStore } from "@repo/store/dieline/dimension.store";
import { useDimensionTypeStore } from "@repo/store/dieline/dimenstionType.store";
import { useMaterialStore } from "@repo/store/dieline/material.store";
import { useSVGStore } from "@repo/store/dieline/svg.store";
import { useThicknessStore } from "@repo/store/dieline/thickness.store";
import { useEffect, useState, useTransition } from "react";
import { resolveDimensions } from "../core/helpers/dimensionResolver";
import { DielineGeneratorProps, MaterialKey } from "../data/types";
import { toPt } from "../utils/sizeConvertor";
import { useContextStore } from "@repo/store/dieline/context.store";
import { useFormatStore } from "@repo/store/dieline/format.store";

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
  const { setThickness, customThickness, thickness } = useThicknessStore();
  const { dimensionType } = useDimensionTypeStore();
  const { setContext } = useContextStore();
  const { format } = useFormatStore();
  const { setSvg } = useSVGStore();
  const [isRendering, startTransition] = useTransition();

  // set defaults
  useEffect(() => {
    setDefaultDimension(dieline.dimensions.defaultDimensions);
    setMaterial(dieline.materials.default.value as MaterialKey);
    setBleed(dieline.defaultBleed);
    setThickness(material.thickness);
  }, []);

  const widthPT = toPt(dimension.width);
  const lengthPT = toPt(dimension.length);
  const heightPT = toPt(dimension.height);

  const resolved = resolveDimensions({
    width: widthPT,
    length: lengthPT,
    height: heightPT,
    dimensionType,
    material,
    customThickness,
  });

  const deps = [
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
  ];

  useEffect(() => {
    setContext({
      bleed,
      dimension,
      material,
      customThickness,
      thickness,
      dimensionType,
      format,
    });

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
  }, deps);

  return {
    resolved,
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
