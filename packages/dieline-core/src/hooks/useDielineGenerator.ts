import { materials } from "@repo/store/data/dieline";
import { DimensionType, MaterialKey } from "@repo/store/data/types";
import { useDeveloperToolsStore } from "@repo/store/dieline/developerTools.store";
import { useDielineSettingsStore } from "@repo/store/dieline/dielineSettings.store";
import { useSVGStore } from "@repo/store/dieline/svg.store";
import { ISpec } from "@repo/store/editor/dielineSpec.store";
import { useVariableStore } from "@repo/store/editor/variables.store";
import { useEffect, useTransition } from "react";
import Pacsaz from "../core/Pacsaz";
import { resolveDimensions } from "../utils/dimensionResolver";
import { resolveOffsets } from "../utils/offsetResolver";
import Drawer from "../core/dieline/Drawer";

interface Dieline {
  materials: string;
  specification: ISpec.Specs;
  dimensionTypes: string;
  minWidth: number;
  minLength: number;
  minHeight: number;
  settings: DielineSettings;
}

type DielineSettings = {
  bleed: number;
  width: number;
  length: number;
  height: number;
  thickness: number;
  material: string;
  dimensionType: string;
};

interface DielineType extends Dieline {
  settings: DielineSettings;
}

export function useDielineGenerator(
  dieline: DielineType,
  app: "client" | "editor",
) {
  console.log("dieline", dieline);
  const specs = dieline.specification;
  const setts = dieline.settings;
  const [isRendering, startTransition] = useTransition();
  const { setDefaultSettings, settings } = useDielineSettingsStore();
  const { developerTools } = useDeveloperToolsStore();
  const { variables } = useVariableStore();
  const drawer = new Pacsaz.models.Drawer(dieline.specification, variables);
  const offsets = resolveOffsets();
  const { setSvg } = useSVGStore();

  // set defaults
  useEffect(() => {
    const dimensionTypes = dieline.dimensionTypes.split(",") as DimensionType[];

    const mats = dieline.materials
      .split(",")
      .map((i) => materials.find((m) => m.value === i))
      .filter((i) => i !== undefined);
    const material = materials.find((m) => m.value === setts.material)!;

    setDefaultSettings({
      bleed: setts.bleed,
      dimension: {
        raw: { width: setts.width, length: setts.length, height: setts.height },
        resolved: resolveDimensions(
          { width: setts.width, length: setts.length, height: setts.height },
          offsets,
        ),
      },
      dimensionTypes: dimensionTypes,
      minDimension: {
        width: dieline.minWidth,
        height: dieline.minHeight,
        length: dieline.minLength,
      },
      material: material,
      materials: mats,
      thickness: material.thickness,

      dimensionType: setts.dimensionType as DimensionType,
      format: "pdf",
      showOverallRulers: false,
    });
  }, []);

  useEffect(() => {
    startTransition(() => {
      const svg = drawer.model();
      setSvg(svg);
    });
  }, [
    settings,
    Drawer,
    app === "editor" ? specs : undefined,
    variables,
    developerTools,
  ]);

  return {
    isRendering,
  };
}
