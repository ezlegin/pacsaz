import { bleeds } from "@repo/store/data/dieline";
import { useDeveloperToolsStore } from "@repo/store/dieline/developerTools.store";
import { useDielineSettingsStore } from "@repo/store/dieline/dielineSettings.store";
import { useSVGStore } from "@repo/store/dieline/svg.store";
import { ISpec } from "@repo/store/editor/dielineSpec.store";
import { useVariableStore } from "@repo/store/editor/variables.store";
import { useEffect, useTransition } from "react";
import { Drawer } from "../core/dieline/Drawer";
import { resolveDimensions } from "../utils/dimensionResolver";
import { resolveOffsets } from "../utils/offsetResolver";

export function useDielineGenerator(specs: ISpec.Specs) {
  const [isRendering, startTransition] = useTransition();
  const { setDefaultSettings, settings } = useDielineSettingsStore();
  const { developerTools } = useDeveloperToolsStore();
  const { variables } = useVariableStore();

  const dieline = new Drawer(specs, variables);
  const offsets = resolveOffsets();
  const { setSvg } = useSVGStore();

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
      const svg = dieline.model();
      setSvg(svg);
    });
  }, [settings, specs, variables, developerTools]);

  return {
    isRendering,
  };
}
