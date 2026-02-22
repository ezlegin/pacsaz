import { bleeds } from "@repo/store/data/dieline";
import { useDeveloperToolsStore } from "@repo/store/dieline/developerTools.store";
import { useDielineSettingsStore } from "@repo/store/dieline/dielineSettings.store";
import { useEffect, useTransition } from "react";
import { Dieline } from "../core/dieline/Dieline";
import { resolveDimensions } from "../utils/dimensionResolver";
import { resolveOffsets } from "../utils/offsetResolver";

export function useDielineGenerator(dieline: Dieline) {
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
      format,
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
      showOverallRulers: false,
    });
  }, []);

  // set on change
  useEffect(() => {
    startTransition(() => {
      dieline.model();
    });
  }, [
    dimension,
    dimensionType,
    material,
    bleed,
    dieline,
    thickness,
    format,

    showAnchors,
    showWatermark,
    showOverallRulers,
  ]);

  return {
    isRendering,
  };
}
