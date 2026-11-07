import { newId } from "../edit/tree";
import type { EdgeFeature, Expr, PanelsNode } from "../spec/types";

/**
 * Ready-made box bodies. Each is an ordinary `panels` node, so everything about
 * it stays editable after it is placed.
 */

export type PresetId = "reverseTuckEnd" | "straightTuckEnd" | "snapLockBottom" | "autoLockBottom" | "gableHandle" | "keyboardBox" | "sleeve" | "fefco0201";

export const PRESETS: { id: PresetId; name: string; description: string }[] = [
  { id: "reverseTuckEnd", name: "Reverse tuck end", description: "Tuck lids at opposite ends on opposite panels. The classic folding carton." },
  { id: "straightTuckEnd", name: "Straight tuck end", description: "Both tuck lids on the back panel." },
  { id: "snapLockBottom", name: "Snap lock bottom", description: "Tuck lid on top; the bottom's four flaps lock into each other without glue." },
  { id: "autoLockBottom", name: "Auto-lock bottom", description: "Tuck lid on top; a pre-glued crash-lock bottom that opens when the carton is squared up." },
  { id: "gableHandle", name: "Gable handle carton", description: "A carrying carton: roofs meet in the middle under a doubled handle, on a snap lock bottom." },
  { id: "keyboardBox", name: "Keyboard box", description: "A self-locking mailer: double side walls tab into slots along the base, under a one-piece lid." },
  { id: "sleeve", name: "Sleeve", description: "Four panels and a glue flap, open at both ends." },
  { id: "fefco0201", name: "FEFCO 0201 case", description: "Regular slotted corrugated case with full-depth-half flaps." },
];

export type BottomType = "plain" | "reverseTuck" | "snapLock" | "autoLock";

export const BOTTOM_TYPES: { id: BottomType; name: string }[] = [
  { id: "plain", name: "Plain edges" },
  { id: "reverseTuck", name: "Tuck lid" },
  { id: "snapLock", name: "Snap lock" },
  { id: "autoLock", name: "Auto-lock" },
];

const feature = (component: string, extra: Partial<EdgeFeature> = {}): EdgeFeature => ({ component, ...extra });
/** Half a board: how much shorter the keyboard box's inner walls are at each end. */
const CLEAR = "max(0.25, thickness / 2)";

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

/** How much the FEFCO 0201's free-end panel and side creases fall short, as on the sample die. */
const FEFCO_SHORT = "1";
/** The FEFCO joint (glue flap) depth: 45 mm on the 300 mm high sample, 30–50 mm otherwise. */
const FEFCO_JOINT = "clamp(height * 0.15, 30, 50)";

/** A closed bottom's feature for each panel of a front, side, back, side body. */
export function bottomFeatures(type: BottomType): (EdgeFeature | undefined)[] {
  switch (type) {
    case "plain":
      return [undefined, undefined, undefined, undefined];
    case "reverseTuck":
      return [undefined, feature("lib:dustFlap", { flip: true }), feature("lib:tuckLid"), feature("lib:dustFlap")];
    case "snapLock":
      return [feature("lib:snapLockNotched"), feature("lib:snapLockSide", { flip: true, args: { wedge: "-1" } }), feature("lib:snapLockTab"), feature("lib:snapLockSide", { args: { wedge: "-1" } })];
    case "autoLock":
      return [
        feature("lib:autoLockMain", { flip: true }),
        feature("lib:autoLockSide", { flip: true }),
        feature("lib:autoLockMain", { flip: true }),
        feature("lib:autoLockSide", { flip: true }),
      ];
  }
}

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

    case "snapLockBottom":
      return {
        ...base,
        panels: [
          panel("front", FACE, feature("lib:tuckLid"), feature("lib:snapLockNotched")),
          panel("side1", SIDE, feature("lib:dustFlap", { flip: true }), feature("lib:snapLockSide", { flip: true, args: { wedge: "-1" } })),
          panel("back", FACE, undefined, feature("lib:snapLockTab")),
          panel("side2", SIDE, feature("lib:dustFlap"), feature("lib:snapLockSide", { args: { wedge: "-1" } })),
        ],
      };

    case "autoLockBottom":
      return {
        ...base,
        panels: [
          panel("front", FACE, feature("lib:tuckLid"), feature("lib:autoLockMain", { flip: true })),
          panel("side1", SIDE, feature("lib:dustFlap", { flip: true }), feature("lib:autoLockSide", { flip: true })),
          panel("back", FACE, undefined, feature("lib:autoLockMain", { flip: true })),
          panel("side2", SIDE, feature("lib:dustFlap"), feature("lib:autoLockSide", { flip: true })),
        ],
      };

    case "gableHandle":
      return {
        ...base,
        // As on the sample die: a deep glue flap (45 mm on a 152 mm side), side
        // lock flaps with straight tabs, and a grip flap in the back handle's slot.
        right: feature("lib:glueFlap", { args: { depth: "clamp(min(length, width) * 0.3, 15, 50)" } }),
        panels: [
          panel("front", FACE, feature("lib:gableRoof"), feature("lib:snapLockNotched")),
          panel("side1", SIDE, feature("lib:gableGusset"), feature("lib:snapLockSide", { flip: true })),
          panel("back", FACE, feature("lib:gableRoof", { args: { grip: "1" } }), feature("lib:snapLockTab")),
          panel("side2", SIDE, feature("lib:gableGusset"), feature("lib:snapLockSide")),
        ],
      };

    case "keyboardBox": {
      const wall = "height";
      const top = "thickness + 2";
      const inner = "height - 0.75 * thickness";
      const { right: _none, ...body } = base;
      return {
        ...body,
        height: SIDE,
        left: feature("lib:keyboardTabs"),
        right: feature("lib:keyboardTabs"),
        // The inner walls are one board shorter at each end, so they drop in past
        // the folded ears; the strip over each double wall slopes up to the outer wall.
        panels: [
          { ...panel("inner1", inner), inset: { left: CLEAR, right: CLEAR } },
          { ...panel("top1", top), inset: { left: CLEAR } },
          panel("wall1", wall),
          panel("base", FACE, feature("lib:keyboardLid"), feature("lib:keyboardFront")),
          panel("wall2", wall),
          { ...panel("top2", top), inset: { right: CLEAR } },
          { ...panel("inner2", inner), inset: { left: CLEAR, right: CLEAR } },
        ],
      };
    }

    case "sleeve":
      return {
        ...base,
        panels: [panel("front", FACE), panel("side1", SIDE), panel("back", FACE), panel("side2", SIDE)],
      };

    case "fefco0201": {
      // Measured from a real B-flute die (400 × 300 × 300 on 3 mm board, Sample.pdf):
      // the body is as tall as the side panels' creases, the front and back
      // creases sit one board further out at each end, and the panel at the free
      // end is 1 mm short so the joint closes without pushing the case out of square.
      const inner = () => feature("lib:slottedFlap");
      const outer = () => feature("lib:slottedFlap", { args: { raised: "1" } });
      return {
        ...base,
        height: `height - max(0.3, thickness) - ${FEFCO_SHORT}`,
        // The manufacturer's joint: deeper than a carton's glue flap, 15° tapers.
        right: feature("lib:glueFlap", { args: { depth: FEFCO_JOINT, taper: `(${FEFCO_JOINT}) * 0.26795` } }),
        panels: [
          panel("front", FACE, outer(), outer()),
          panel("side1", SIDE, inner(), inner()),
          panel("back", FACE, outer(), outer()),
          panel("side2", `${SIDE} - ${FEFCO_SHORT}`, inner(), inner()),
        ],
      };
    }

  }
}
