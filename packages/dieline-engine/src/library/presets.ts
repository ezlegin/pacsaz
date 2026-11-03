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

export function presetBody(id: PresetId, name: string): PanelsNode {
  const base = { id: newId(), name, kind: "panels" as const, height: "height", right: feature("lib:glueFlap") };

  switch (id) {
    case "reverseTuckEnd":
      // Top lid on the back panel, bottom lid on the front; dust flaps slope
      // towards the lid they sit beside.
      return {
        ...base,
        panels: [
          panel("front", "length", undefined, feature("lib:tuckLid")),
          panel("side1", "width", feature("lib:dustFlap"), feature("lib:dustFlap")),
          panel("back", "length", feature("lib:tuckLid")),
          panel("side2", "width", feature("lib:dustFlap", { flip: true }), feature("lib:dustFlap", { flip: true })),
        ],
      };

    case "straightTuckEnd":
      return {
        ...base,
        panels: [
          panel("front", "length"),
          panel("side1", "width", feature("lib:dustFlap"), feature("lib:dustFlap", { flip: true })),
          panel("back", "length", feature("lib:tuckLid"), feature("lib:tuckLid")),
          panel("side2", "width", feature("lib:dustFlap", { flip: true }), feature("lib:dustFlap")),
        ],
      };

    case "sleeve":
      return {
        ...base,
        panels: [panel("front", "length"), panel("side1", "width"), panel("back", "length"), panel("side2", "width")],
      };

    case "fefco0201": {
      const flap = () => feature("lib:slottedFlap");
      return {
        ...base,
        // The manufacturer's joint of a corrugated case is wider than a carton's glue flap.
        right: feature("lib:glueFlap", { args: { depth: "max(30, height * 0.1)" } }),
        panels: [
          panel("front", "length", flap(), flap()),
          panel("side1", "width", flap(), flap()),
          panel("back", "length", flap(), flap()),
          panel("side2", "width", flap(), flap()),
        ],
      };
    }
  }
}
