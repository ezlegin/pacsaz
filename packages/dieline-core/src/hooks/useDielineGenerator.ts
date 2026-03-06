import { bleeds } from "@repo/store/data/dieline";
import { useDeveloperToolsStore } from "@repo/store/dieline/developerTools.store";
import { useDielineSettingsStore } from "@repo/store/dieline/dielineSettings.store";
import { useDielineSpecStore } from "@repo/store/editor/dielineSpec.store";
import { useEffect, useTransition } from "react";
import { resolveDimensions } from "../utils/dimensionResolver";
import { resolveOffsets } from "../utils/offsetResolver";
import { Drawer } from "../core/dieline/Drawer";
import { useVariableStore } from "@repo/store/editor/variables.store";

export function useDielineGenerator(dieline: Drawer) {
  const [isRendering, startTransition] = useTransition();
  const { shapes, rulers } = useDielineSpecStore();

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
  const { variables } = useVariableStore();

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
    shapes,
    shapes,
    variables,
    rulers,

    showAnchors,
    showWatermark,
    showOverallRulers,
  ]);

  return {
    isRendering,
  };
}
