"use client";

import type { DielineDocument, PanelsNode } from "@repo/dieline-engine";
import { rteBox } from "@repo/dieline-engine/fixtures";
import { EditorStore, Studio } from "@repo/editor";
import { useEffect, useState } from "react";

/** A size range like a real template has, so ghosts and checks have something to show. */
const SIZE_RANGE = {
  min: { width: 40, length: 40, height: 50 },
  max: { width: 200, length: 160, height: 260 },
};

/** The reverse tuck end with a few customer options, so "Customer view" has something to show. */
function withCustomerOptions(doc: DielineDocument): DielineDocument {
  const body = doc.nodes[0] as PanelsNode;
  const panels = body.panels.map((p, i) =>
    i === 2 && p.top ? { ...p, top: { ...p.top, customize: { choices: ["lib:plainFlap"], args: ["depth"] } } } : p,
  );
  return {
    ...doc,
    params: [{ name: "hangHole", label: "Hang hole size", default: 8, min: 5, max: 14, unit: "mm", exposed: true }],
    nodes: [
      { ...body, panels },
      {
        id: "hangHole",
        name: "hangHole_",
        label: "Hang hole",
        kind: "ellipse",
        lineType: "cut",
        rx: "hangHole / 2",
        ry: "hangHole / 2",
        hidden: true,
        customize: { optional: true, move: 15 },
        transform: { x: "@body.back.center.x", y: "@body.back.top.y - 15" },
      },
    ],
    customize: { cutouts: { shapes: ["rect", "ellipse"], max: 2 } },
  };
}

/** The full Studio on the reverse tuck end box body, with nothing saved. */
export default function Playground() {
  const [store] = useState(
    () => new EditorStore(withCustomerOptions(rteBox), { width: 100, length: 60, height: 120, thickness: 0.5, bleed: 3 }),
  );

  // Handy from the browser console while developing the editor.
  useEffect(() => {
    (window as unknown as { __editor: EditorStore }).__editor = store;
  }, [store]);

  return <Studio store={store} title="Playground · reverse tuck end" sizeRange={SIZE_RANGE} />;
}
