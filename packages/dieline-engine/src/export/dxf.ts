import M from "makerjs";
import type { RenderResult } from "../eval/render";
import { toMaker } from "../geometry/makerjs";
import type { Prim } from "../geometry/types";
import { addNicks, type NickOptions } from "./nicks";
import { DXF_LAYER_COLORS, DXF_LAYERS } from "./styles";

/**
 * DXF for die makers: one layer per line type (`CUT`, `CREASE`, ...), each in
 * the die-making colour (blue cut, red crease), guides left out, millimetre units.
 *
 * Bleed is never written: it is a print-design aid, and a DXF goes to the die
 * maker, where an extra closed outline would read as one more knife. Glue areas
 * stay, on their own GLUE layer and colour like every other line type.
 */
export function toDXF(result: RenderResult, options: { nicks?: NickOptions } = {}): string {
  const byLayer = new Map<string, Prim[]>();
  const paths = options.nicks ? addNicks(result.paths, options.nicks) : result.paths;

  for (const p of paths) {
    if (p.lineType === "guide" || p.lineType === "bend") continue;
    const layer = DXF_LAYERS[p.lineType];
    const list = byLayer.get(layer);
    if (list) list.push(p);
    else byLayer.set(layer, [p]);
  }

  // A glue area's outline lies exactly on its flap's cut edges and fold, and
  // viewers paint in file order, so glue goes first and the knife and crease
  // draw over it in their own colours.
  const layers = [...byLayer].sort(([a], [b]) => Number(b === "GLUE") - Number(a === "GLUE"));

  const models: M.IModelMap = {};
  const layerOptions: Record<string, { color: number }> = {};
  for (const [layer, prims] of layers) {
    models[layer] = { ...toMaker(prims), layer };
    const color = DXF_LAYER_COLORS[layer];
    if (color !== undefined) layerOptions[layer] = { color };
  }

  return M.exporter.toDXF({ models }, { units: M.unitType.Millimeter, layerOptions });
}
