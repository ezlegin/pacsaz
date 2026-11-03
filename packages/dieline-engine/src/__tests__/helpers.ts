import { render, type RenderInputs } from "../eval/render";
import type { Path } from "../geometry/types";
import { emptyDocument, type DielineDocument, type Node } from "../spec/types";

export const INPUTS: RenderInputs = { width: 100, length: 60, height: 120, thickness: 0.5 };

export function doc(partial: Partial<DielineDocument>): DielineDocument {
  return { ...emptyDocument(), ...partial };
}

export function renderNodes(nodes: Node[], inputs: Partial<RenderInputs> = {}, extra: Partial<DielineDocument> = {}) {
  return render(doc({ nodes, ...extra }), { ...INPUTS, ...inputs });
}

export const rect = (name: string, width: string, height: string, more: Partial<Node> = {}): Node =>
  ({ id: name, name, kind: "rect", lineType: "cut", width, height, ...more }) as Node;

export const errors = (result: ReturnType<typeof render>) =>
  result.diagnostics.filter((d) => d.severity === "error");

export const byKind = (paths: Path[], kind: Path["kind"]) => paths.filter((p) => p.kind === kind);

/** Every endpoint shared by exactly two paths: the outline is closed and has no stray ends. */
export function isClosedOutline(paths: Path[]): boolean {
  // `+ 0` folds -0 into 0 so tiny negative rounding noise lands on the same key.
  const round = (n: number) => Math.round(n * 1000) / 1000 + 0;
  const key = (p: [number, number]) => `${round(p[0])},${round(p[1])}`;
  const rad = Math.PI / 180;
  const ends = (p: Path): [string, string] | null =>
    p.kind === "line"
      ? [key(p.a), key(p.b)]
      : p.kind === "arc"
        ? [key([p.c[0] + p.r * Math.cos(p.start * rad), p.c[1] + p.r * Math.sin(p.start * rad)]), key([p.c[0] + p.r * Math.cos(p.end * rad), p.c[1] + p.r * Math.sin(p.end * rad)])]
        : null;

  // Slits (a friction lock) end in the board on purpose: drop them first.
  let left = paths.filter((p) => ends(p));
  for (;;) {
    const degree = new Map<string, number>();
    for (const p of left) for (const k of ends(p)!) degree.set(k, (degree.get(k) ?? 0) + 1);
    const next = left.filter((p) => ends(p)!.every((k) => degree.get(k)! > 1));
    if (next.length === left.length) return [...degree.values()].every((d) => d === 2);
    left = next;
  }
}
