"use client";

import { checkDieline, render, type DielineDocument, type Issue, type RenderInputs, type RenderResult } from "@repo/dieline-engine";
import { useMemo } from "react";
import { useEditor } from "./react";
import type { EditorState } from "./store";

export type SizeKey = "current" | "min" | "max";
export type SizedIssue = Issue & { size: SizeKey };

export const SIZE_LABELS: Record<SizeKey, string> = {
  current: "At the preview size",
  min: "At the smallest size",
  max: "At the largest size",
};

// Several components ask for the same analysis on every change, so results are
// cached per render result / document rather than recomputed per caller.
const checks = new WeakMap<RenderResult, Issue[]>();
const checksOf = (r: RenderResult) => {
  let list = checks.get(r);
  if (!list) {
    list = checkDieline(r);
    checks.set(r, list);
  }
  return list;
};

type Ghosts = { min?: RenderResult; max?: RenderResult };
const ghostCache = new WeakMap<DielineDocument, { inputs: RenderInputs; range: EditorState["sizeRange"]; ghosts: Ghosts }>();
const ghostsOf = (doc: DielineDocument, inputs: RenderInputs, range: EditorState["sizeRange"]): Ghosts => {
  if (!range) return {};
  const hit = ghostCache.get(doc);
  if (hit && hit.inputs === inputs && hit.range === range) return hit.ghosts;
  const ghosts = { min: render(doc, { ...inputs, ...range.min }), max: render(doc, { ...inputs, ...range.max }) };
  ghostCache.set(doc, { inputs, range, ghosts });
  return ghosts;
};

/**
 * The template at its extreme sizes, and the design checks at every size. A
 * parametric template that is fine at the preview size can still break where
 * nobody looked: a flap that collides only when the box is small, a gap that
 * opens only when it is large. Ghosts show those sizes; issues list them.
 */
export function useAnalysis(): { ghosts: Ghosts; issues: SizedIssue[] } {
  const doc = useEditor((s) => s.doc);
  const inputs = useEditor((s) => s.inputs);
  const result = useEditor((s) => s.result);
  const range = useEditor((s) => s.sizeRange);

  return useMemo(() => {
    const ghosts = ghostsOf(doc, inputs, range);
    const current = checksOf(result);
    const issues: SizedIssue[] = current.map((i) => ({ ...i, size: "current" as const }));
    // Problems at the extremes are only news if the preview size doesn't have them.
    const seen = new Set(current.map((i) => i.code));
    for (const size of ["min", "max"] as const) {
      const g = ghosts[size];
      if (!g) continue;
      for (const i of checksOf(g)) {
        if (i.severity === "error" || !seen.has(i.code)) issues.push({ ...i, size });
      }
    }
    return { ghosts, issues };
  }, [doc, inputs, result, range]);
}
