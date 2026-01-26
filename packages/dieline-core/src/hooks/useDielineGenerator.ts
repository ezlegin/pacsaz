import { bleeds } from "@repo/store/data/dieline";
import { useDielineSettingsStore } from "@repo/store/dieline/dielineSettings.store";
import { useSVGStore } from "@repo/store/dieline/svg.store";
import { useDeveloperToolsStore } from "@repo/store/dieline/useDeveloperToolsStore";
import { useEffect, useTransition } from "react";
import { Dieline } from "../data/types";
import { resolveDimensions } from "../utils/dimensionResolver";
import { resolveOffsets } from "../utils/offsetResolver";

export function useDielineGenerator(dieline: Dieline) {
  const { setSvg } = useSVGStore();
  const [isRendering, startTransition] = useTransition();

  const {
    ctx: { showAnchors, showOverallDimensions, showWatermark },
  } = useDeveloperToolsStore();

  const {
    setDefaultSettings,
    settings: { bleed, dimensionType, material, thickness, dimension },
  } = useDielineSettingsStore();
  const offsets = resolveOffsets();

  // set defaults
  useEffect(() => {
    setDefaultSettings({
      bleed: dieline.defaultBleed ?? bleeds.default,
      dimension: {
        raw: dieline.dimensions.defaultDimensions,
        resolved: resolveDimensions(
          dieline.dimensions.defaultDimensions,
          offsets
        ),
      },
      dimensionType: "manufacture",
      format: "pdf",
      material: dieline.materials.default,
      thickness: dieline.materials.default.thickness,
      safeFoldOffset: dieline.materials.default.safeFoldOffset,
    });
  }, []);

  // set on change
  useEffect(() => {
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
    thickness,

    showAnchors,
    showWatermark,
    showOverallDimensions,
  ]);

  return {
    isRendering,
  };
}
