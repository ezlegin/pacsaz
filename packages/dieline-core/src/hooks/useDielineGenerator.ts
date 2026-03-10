import { bleeds, materials } from "@repo/store/data/dieline";
import { useDeveloperToolsStore } from "@repo/store/dieline/developerTools.store";
import { useDielineSettingsStore } from "@repo/store/dieline/dielineSettings.store";
import { useSVGStore } from "@repo/store/dieline/svg.store";
import { ISpec } from "@repo/store/editor/dielineSpec.store";
import { useVariableStore } from "@repo/store/editor/variables.store";
import { useEffect, useTransition } from "react";
import { Drawer } from "../core/dieline/Drawer";
import { resolveDimensions } from "../utils/dimensionResolver";
import { resolveOffsets } from "../utils/offsetResolver";
import {
  Dimension,
  DimensionType,
  MaterialKey,
  MaterialValue,
} from "@repo/store/data/types";
import { DimensionsType } from "../data/types";

interface Dieline {
  specification: ISpec.Specs;
  settings?: DielineSettingsFromDB;
}
export type DielineSettingsFromDB = {
  bleed: number;
  defaultDimension: Dimension;
  minDimension: Dimension;
  materials: string;
  dimensionTypes: string;
};

interface Defaults {
  bleed: number;
  dim: Dimension;
  minDim: Dimension;
  mat: MaterialValue;
  dimensionTypes: DimensionsType;
}

export function useDielineGenerator(
  dieline: Dieline,
  app: "client" | "editor",
) {
  const specs = dieline.specification;
  const setts = dieline.settings;
  const [isRendering, startTransition] = useTransition();
  const { setDefaultSettings, settings } = useDielineSettingsStore();
  const { developerTools } = useDeveloperToolsStore();
  const { variables } = useVariableStore();
  const drawer = new Drawer(dieline.specification, variables);
  const offsets = resolveOffsets();
  const { setSvg } = useSVGStore();

  // set defaults
  useEffect(() => {
    const materailsss = setts?.materials.split(",") as
      | MaterialKey[]
      | undefined;
    const mats = materailsss?.map((i) => materials[i]);
    const dimensionTypes = setts?.dimensionTypes.split(",") as
      | DimensionType[]
      | undefined;

    const defaults: Defaults = {
      bleed: bleeds.default,
      dim: {
        width: 90,
        height: 50,
        length: 160,
      },
      minDim: {
        width: 30,
        height: 30,
        length: 30,
      },
      mat: materials["glossy-cardboard"],
      dimensionTypes: ["manufacture", "inner", "outer"],
    };

    setDefaultSettings({
      bleed: setts?.bleed ?? defaults.bleed,
      dimension: {
        raw: setts?.defaultDimension ?? defaults.dim,
        resolved: resolveDimensions(
          setts?.defaultDimension ?? defaults.dim,
          offsets,
        ),
      },
      dimensionTypes: dimensionTypes ? dimensionTypes : defaults.dimensionTypes,
      minDimension: setts?.minDimension ?? defaults.minDim,
      material: mats ? mats[0]! : defaults.mat,
      materials: mats ? mats : [defaults.mat],
      thickness: mats ? mats[0]!.thickness : defaults.mat.thickness,

      dimensionType: "manufacture",
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
    app === "editor" ? specs : undefined,
    variables,
    developerTools,
  ]);

  return {
    isRendering,
  };
}
