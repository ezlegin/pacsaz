import { bleeds } from "@repo/store/data/dieline";
import { useDeveloperToolsStore } from "@repo/store/dieline/developerTools.store";
import { useDielineSettingsStore } from "@repo/store/dieline/dielineSettings.store";
import { useDielineSpecStore } from "@repo/store/editor/dielineSpec.store";
import { useEffect, useTransition } from "react";
import { resolveDimensions } from "../utils/dimensionResolver";
import { resolveOffsets } from "../utils/offsetResolver";
import { Drawer } from "../core/dieline/Drawer";
import { useVariableStore } from "@repo/store/editor/variables.store";

export function useDielineGenerator() {
  const [isRendering, startTransition] = useTransition();
  const { setDefaultSettings, settings } = useDielineSettingsStore();
  const { developerTools } = useDeveloperToolsStore();
  const { variables } = useVariableStore();
  const { specs } = useDielineSpecStore();
  const dieline = new Drawer(specs, variables);
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

  useEffect(() => {
    startTransition(() => {
      dieline.model();
    });
  }, [settings, Drawer, specs, variables, developerTools]);

  return {
    isRendering,
  };
}
