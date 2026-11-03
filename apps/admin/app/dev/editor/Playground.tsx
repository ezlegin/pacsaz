"use client";

import { findNode, toDXF, toSVG } from "@repo/dieline-engine";
import { tuckEndBox } from "@repo/dieline-engine/fixtures";
import { Canvas, CanvasToolbar, EditorProvider, EditorStore, useEditor, useStore } from "@repo/editor";
import { useEffect, useState } from "react";

const DIMENSIONS = [
  { key: "width", min: 30, max: 300 },
  { key: "length", min: 30, max: 300 },
  { key: "height", min: 30, max: 400 },
  { key: "thickness", min: 0.2, max: 4, step: 0.1 },
] as const;

export default function Playground() {
  const [store] = useState(
    () => new EditorStore(tuckEndBox, { width: 100, length: 60, height: 120, thickness: 0.5 }),
  );

  // Handy from the browser console while developing the canvas.
  useEffect(() => {
    (window as unknown as { __editor: EditorStore }).__editor = store;
  }, [store]);

  return (
    <EditorProvider store={store}>
      <div className="grid h-screen grid-cols-[1fr_320px] overflow-hidden">
        <div className="relative">
          <Canvas className="h-full w-full" />
          <CanvasToolbar className="absolute left-8 top-8" />
        </div>
        <Inspector />
      </div>
    </EditorProvider>
  );
}

/** A throwaway side panel to watch expressions change while the canvas is used. */
function Inspector() {
  const store = useStore();
  const inputs = useEditor((s) => s.inputs);
  const doc = useEditor((s) => s.doc);
  const selection = useEditor((s) => s.selection);
  const result = useEditor((s) => s.result);

  const node = selection.length === 1 ? findNode(doc, selection[0]!)?.node : null;
  const problems = result.diagnostics;

  const download = (name: string, content: string, type: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = Object.assign(document.createElement("a"), { href: url, download: name });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className="flex flex-col gap-4 overflow-y-auto border-l bg-muted/40 p-4 text-sm">
      <h1 className="font-semibold">Editor v2 · canvas playground</h1>

      <section className="space-y-2">
        {DIMENSIONS.map((d) => (
          <label key={d.key} className="block">
            <span className="flex justify-between text-xs text-muted-foreground">
              <span className="capitalize">{d.key}</span>
              <span className="tabular-nums">{inputs[d.key]}</span>
            </span>
            <input
              type="range"
              className="w-full"
              min={d.min}
              max={d.max}
              step={"step" in d ? d.step : 1}
              value={inputs[d.key]}
              onChange={(e) => store.setInputs({ [d.key]: Number(e.target.value) })}
            />
          </label>
        ))}
      </section>

      <section>
        <h2 className="mb-1 text-xs font-medium uppercase text-muted-foreground">Selected</h2>
        {node ? (
          <pre className="max-h-96 overflow-auto rounded bg-background p-2 text-[11px] leading-snug">
            {JSON.stringify(node, null, 2)}
          </pre>
        ) : (
          <p className="text-xs text-muted-foreground">
            Click a line or panel. Double-click a group to enter it. Drag to move, drag handles to reshape, hold Alt for
            plain numbers, Ctrl to ignore snapping.
          </p>
        )}
      </section>

      {problems.length > 0 && (
        <section>
          <h2 className="mb-1 text-xs font-medium uppercase text-muted-foreground">Problems</h2>
          <ul className="space-y-1 text-xs">
            {problems.map((p, i) => (
              <li key={i} className={p.severity === "error" ? "text-red-600" : "text-amber-600"}>
                {"id" in p.target ? `${result.nodes[p.target.id]?.name ?? p.target.id}: ` : ""}
                {p.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-auto flex gap-2">
        <button
          type="button"
          className="rounded border bg-background px-2 py-1 text-xs"
          onClick={() => download("dieline.svg", toSVG(result, { includeRulers: true }), "image/svg+xml")}
        >
          SVG
        </button>
        <button
          type="button"
          className="rounded border bg-background px-2 py-1 text-xs"
          onClick={() => download("dieline.dxf", toDXF(result), "application/dxf")}
        >
          DXF
        </button>
      </section>
    </aside>
  );
}
