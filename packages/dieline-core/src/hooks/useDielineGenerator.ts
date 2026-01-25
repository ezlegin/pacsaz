import { useBleedStore } from "@repo/store/dieline/bleed.store";
import { useContextStore } from "@repo/store/dieline/context.store";
import { useDimensionStore } from "@repo/store/dieline/dimension.store";
import { useDimensionTypeStore } from "@repo/store/dieline/dimensionType.store";
import { useFormatStore } from "@repo/store/dieline/format.store";
import {
  MaterialKey,
  useMaterialStore,
} from "@repo/store/dieline/material.store";
import { useOffsetStore } from "@repo/store/dieline/offset.store";
import { useSVGStore } from "@repo/store/dieline/svg.store";
import { useThicknessStore } from "@repo/store/dieline/thickness.store";
import { useDeveloperToolsStore } from "@repo/store/dieline/useDeveloperToolsStore";
import { useEffect, useTransition } from "react";
import { Dieline } from "../data/types";
import { resolveOffsets } from "../utils/offsetResolver";

export function useDielineGenerator(dieline: Dieline) {
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
  const offsets = resolveOffsets();

  // set defaults
  useEffect(() => {
    setOffset(offsets);
    setDefaultDimension(dieline.dimensions.defaultDimensions);
    setMaterial(dieline.materials.default.value as MaterialKey);
    setBleed(dieline.defaultBleed);
    setThickness(material.thickness);
  }, []);

  // set on change
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
      const result = dieline.model();
      setSvg(result);
    });
  }, [
    dimension,
    dimensionType,
    material,
    bleed,
    dieline,
    customThickness,

    showAnchors,
    showWatermark,
    showOverallDimensions,
  ]);

  return {
    isRendering,
  };
}
