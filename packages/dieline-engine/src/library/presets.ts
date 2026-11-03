import { newId } from "../edit/tree";
import type { EdgeFeature, Expr, PanelsNode } from "../spec/types";

/**
 * Ready-made box bodies. Each is an ordinary `panels` node, so everything about
 * it stays editable after it is placed.
 */

export type PresetId = "reverseTuckEnd" | "straightTuckEnd" | "sleeve" | "fefco0201";

export const PRESETS: { id: PresetId; name: string; description: string }[] = [
  { id: "reverseTuckEnd", name: "Reverse tuck end", description: "Tuck lids at opposite ends on opposite panels. The classic folding carton." },
  { id: "straightTuckEnd", name: "Straight tuck end", description: "Both tuck lids on the back panel." },
  { id: "sleeve", name: "Sleeve", description: "Four panels and a glue flap, open at both ends." },
  { id: "fefco0201", name: "FEFCO 0201 case", description: "Regular slotted corrugated case with full-depth-half flaps." },
];

const feature = (component: string, extra: Partial<EdgeFeature> = {}): EdgeFeature => ({ component, ...extra });
const panel = (name: string, width: Expr, top?: EdgeFeature, bottom?: EdgeFeature) => ({
  id: newId(),
  name,
  width,
  ...(top ? { top } : {}),
  ...(bottom ? { bottom } : {}),
});

/**
 * Front and back are the larger faces, the sides the smaller ones, whichever of
 * length and width is entered larger, so lids always sit on the wide panels.
 */
const FACE = "max(length, width)";
const SIDE = "min(length, width)";

export function presetBody(id: PresetId, name: string): PanelsNode {
  const base = { id: newId(), name, kind: "panels" as const, height: "height", right: feature("lib:glueFlap") };

  switch (id) {
    case "reverseTuckEnd":
      // Top lid on the front panel, bottom lid on the back; each dust flap keeps
      // its square side towards the lid it sits under.
      return {
        ...base,
        panels: [
          panel("front", FACE, feature("lib:tuckLid")),
          panel("side1", SIDE, feature("lib:dustFlap", { flip: true }), feature("lib:dustFlap", { flip: true })),
          panel("back", FACE, undefined, feature("lib:tuckLid")),
          panel("side2", SIDE, feature("lib:dustFlap"), feature("lib:dustFlap")),
        ],
      };

    case "straightTuckEnd":
      return {
        ...base,
        panels: [
          panel("front", FACE),
          panel("side1", SIDE, feature("lib:dustFlap"), feature("lib:dustFlap", { flip: true })),
          panel("back", FACE, feature("lib:tuckLid"), feature("lib:tuckLid")),
          panel("side2", SIDE, feature("lib:dustFlap", { flip: true }), feature("lib:dustFlap")),
        ],
      };

    case "sleeve":
      return {
        ...base,
        panels: [panel("front", FACE), panel("side1", SIDE), panel("back", FACE), panel("side2", SIDE)],
      };

    case "fefco0201": {
      const flap = () => feature("lib:slottedFlap");
      return {
        ...base,
        // The manufacturer's joint of a corrugated case is wider than a carton's glue flap.
        right: feature("lib:glueFlap", { args: { depth: "max(30, height * 0.1)" } }),
        panels: [
          panel("front", FACE, flap(), flap()),
          panel("side1", SIDE, flap(), flap()),
          panel("back", FACE, flap(), flap()),
          panel("side2", SIDE, flap(), flap()),
        ],
      };
    }
  }
}
