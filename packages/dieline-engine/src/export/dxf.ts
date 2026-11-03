import M from "makerjs";
import type { RenderResult } from "../eval/render";
import { toMaker } from "../geometry/makerjs";
import type { Prim } from "../geometry/types";
import { addNicks, type NickOptions } from "./nicks";
import { DXF_LAYERS } from "./styles";

/**
 * DXF for die makers: one layer per line type (`CUT`, `CREASE`, ...), guides left
 * out, millimetre units.
 */
export function toDXF(result: RenderResult, options: { includeBleed?: boolean; nicks?: NickOptions } = {}): string {
  const byLayer = new Map<string, Prim[]>();
  const paths = options.nicks ? addNicks(result.paths, options.nicks) : result.paths;

  for (const p of paths) {
    if (p.lineType === "guide") continue;
    const layer = DXF_LAYERS[p.lineType];
    const list = byLayer.get(layer);
    if (list) list.push(p);
    else byLayer.set(layer, [p]);
  }

  if (options.includeBleed && result.bleed.length) byLayer.set("BLEED", result.bleed);

  const models: M.IModelMap = {};
  for (const [layer, prims] of byLayer) {
    models[layer] = { ...toMaker(prims), layer };
  }

  return M.exporter.toDXF({ models }, { units: M.unitType.Millimeter });
}
