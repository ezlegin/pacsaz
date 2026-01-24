import { useBleedStore } from "@repo/store/dieline/bleed.store";
import { useContextStore } from "@repo/store/dieline/context.store";
import { useDimensionStore } from "@repo/store/dieline/dimension.store";
import { useDimensionTypeStore } from "@repo/store/dieline/dimenstionType.store";
import { useFormatStore } from "@repo/store/dieline/format.store";
import { useMaterialStore } from "@repo/store/dieline/material.store";
import { useSVGStore } from "@repo/store/dieline/svg.store";
import { useThicknessStore } from "@repo/store/dieline/thickness.store";
import { useDeveloperToolsStore } from "@repo/store/dieline/useDeveloperToolsStore";
import { useEffect, useTransition } from "react";
import { resolveDimensions } from "../utils/dimensionResolver";
import { DielineGeneratorProps, MaterialKey } from "../data/types";
import { toPt } from "../utils/sizeConvertor";
import { resolveOffsets } from "../utils/offsetResolver";
import { useOffsetStore } from "@repo/store/dieline/offset.store";

export function useDielineGenerator(dieline: DielineGeneratorProps) {
  const { material, setMaterial } = useMaterialStore();
  const { dimension, setDefaultDimension } = useDimensionStore();
  const { bleed, setBleed } = useBleedStore();
  const { setThickness, customThickness, thickness } = useThicknessStore();
  const { dimensionType } = useDimensionTypeStore();
  const { setContext } = useContextStore();
  const { format } = useFormatStore();
  const { setSvg } = useSVGStore();
  const [isRendering, startTransition] = useTransition();
  const {
    ctx: { showAnchors, showOverallDimensions, showWatermark },
  } = useDeveloperToolsStore();
  const { setOffset } = useOffsetStore();

  // set defaults
  useEffect(() => {
    setDefaultDimension(dieline.dimensions.defaultDimensions);
    setMaterial(dieline.materials.default.value as MaterialKey);
    setBleed(dieline.defaultBleed);
    setThickness(material.thickness);
  }, []);

  const { height, length, width } = {
    width: toPt(dimension.width),
    length: toPt(dimension.length),
    height: toPt(dimension.height),
  };

  const offsets = resolveOffsets();

  const resolved = resolveDimensions({
    width,
    length,
    height,
    dimensionType,
    offsets,
  });

  useEffect(() => {
    setOffset(offsets);

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
          resolved,
        },
      });

      setSvg(result);
    });
  }, [
    width,
    length,
    height,
    dimensionType,
    material,
    showAnchors,
    showWatermark,
    showOverallDimensions,
    bleed,
    customThickness,
    dieline,
  ]);

  return {
    resolved,
    isRendering,
  };
}
