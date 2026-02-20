import { bleeds } from "@repo/store/data/dieline";
import { useDielineSettingsStore } from "@repo/store/dieline/dielineSettings.store";
import { useSVGStore } from "@repo/store/dieline/svg.store";
import { useDeveloperToolsStore } from "@repo/store/dieline/useDeveloperToolsStore";
import { useEffect, useTransition } from "react";
import { resolveDimensions } from "../utils/dimensionResolver";
import { resolveOffsets } from "../utils/offsetResolver";
import { Dieline } from "../core/dieline/Dieline";

export function useDielineGenerator(dieline: Dieline) {
  const { setSvg } = useSVGStore();
  const [isRendering, startTransition] = useTransition();

  const {
    ctx: { showAnchors, showWatermark },
  } = useDeveloperToolsStore();

  const {
    setDefaultSettings,
    settings: {
      bleed,
      dimensionType,
      material,
      thickness,
      dimension,
      showOverallRulers,
    },
  } = useDielineSettingsStore();
  const offsets = resolveOffsets();

  // set defaults
  useEffect(() => {
    setDefaultSettings({
      bleed: dieline.defaultBleed ?? bleeds.default,
      dimension: {
        raw: dieline.defaultDimensions,
        resolved: resolveDimensions(dieline.defaultDimensions, offsets),
      },
      dimensionType: "manufacture",
      format: "pdf",
      material: dieline.materials[0]!,
      thickness: dieline.materials[0]!.thickness,
      safeFoldOffset: dieline.materials[0]!.safeFoldOffset,
      showOverallRulers: false,
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
    showOverallRulers,
  ]);

  return {
    isRendering,
  };
}
