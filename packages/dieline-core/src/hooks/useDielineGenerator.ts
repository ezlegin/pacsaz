import { materials } from "@repo/dieline-core/data/materials";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { setDeveloperTool } from "@repo/store/slices/developerToolsSlice";
import { setDefaultSettings } from "@repo/store/slices/dielineSettingsSlice";
import { setSvg } from "@repo/store/slices/svgSlice";
import { variablesSelectors } from "@repo/store/slices/variablesSlice";
import { DimensionType, ISpec, IVar } from "@repo/store/types";
import { useEffect, useTransition } from "react";
import Pacsaz from "../core/pacsaz";
import { resolveDimensions } from "../utils/dimensionResolver";
import { resolveOffsets } from "../utils/offsetResolver";
import Drawer from "../core/dieline/Drawer";

interface Dieline {
  materials: string;
  defaultMaterial: string;
  variables: IVar.VariableMap;
  specification: ISpec.Specs;
  dimensionTypes: string;
  minWidth: number;
  minLength: number;
  minHeight: number;
  maxWidth: number;
  maxLength: number;
  maxHeight: number;
  settings: DielineSettings;
  customSettings?: DielineSettings | null;
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

export function useDielineGenerator(
  dieline: Dieline,
  user?: any | null,
  showWatermark?: boolean,
) {
  const nodes = dieline.specification.nodes;
  const rulers = dieline.specification.rulers;

  const dielineSettings = dieline.customSettings ?? dieline.settings;
  const [isRendering, startTransition] = useTransition();
  const dispatch = useAppDispatch();

  const settings = useAppSelector((state) => state.dielineSettings);
  const developerTools = useAppSelector((state) => state.developerTools);
  const variables = useAppSelector((state) =>
    variablesSelectors.selectAll(state),
  );

  const drawer = new Pacsaz.models.Drawer(nodes, dieline.variables, rulers);
  const offsets = resolveOffsets();

  // set defaults
  useEffect(() => {
    const dims = {
      width: dielineSettings.width,
      length: dielineSettings.length,
      height: dielineSettings.height,
    };
    const dimensionTypes = dieline.dimensionTypes.split(",") as DimensionType[];
    const mats = dieline.materials
      .split(",")
      .map((i) => materials.find((m) => m.value === i))
      .filter((i) => i !== undefined);
    const material = materials.find(
      (m) =>
        m.value ===
        (dieline.customSettings?.material ?? dieline.defaultMaterial),
    )!;

    dispatch(
      setDefaultSettings({
        bleed: dielineSettings.bleed,
        dimension: {
          raw: dims,
          resolved: resolveDimensions(dims, offsets),
        },
        dimensionTypes: dimensionTypes,
        minDimension: {
          width: dieline.minWidth,
          height: dieline.minHeight,
          length: dieline.minLength,
        },
        maxDimension: {
          width: dieline.maxWidth,
          height: dieline.maxHeight,
          length: dieline.maxLength,
        },
        material: material,
        materials: mats,
        thickness: dielineSettings.thickness,
        dimensionType: dielineSettings.dimensionType as DimensionType,
        format: "pdf",
        showOverallRulers: false,
      }),
    );

    dispatch(
      setDeveloperTool({
        key: "showWatermark",
        value: showWatermark ?? !!!user,
      }),
    );
  }, []);

  useEffect(() => {
    startTransition(() => {
      const svg = drawer.model();
      dispatch(setSvg(svg));
    });
  }, [settings, Drawer, dieline.specification, developerTools, variables]);

  return {
    isRendering,
  };
}
