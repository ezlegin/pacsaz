import { bleeds } from "@repo/store/data/dieline";
import { useDeveloperToolsStore } from "@repo/store/dieline/developerTools.store";
import { useDielineSettingsStore } from "@repo/store/dieline/dielineSettings.store";
import { useDielineSpecStore } from "@repo/store/dieline/dielineSpec.store";
import { useEffect, useTransition } from "react";
import { resolveDimensions } from "../utils/dimensionResolver";
import { resolveOffsets } from "../utils/offsetResolver";
import { Drawer } from "../core/dieline/drawer";

export function useDielineGenerator(dieline: Drawer) {
  const [isRendering, startTransition] = useTransition();
  const { dielineSpec: json } = useDielineSpecStore();

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
    json,
    useDielineSpecStore,

    showAnchors,
    showWatermark,
    showOverallRulers,
  ]);

  return {
    isRendering,
  };
}
