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
  const degree = new Map<string, number>();
  const bump = (p: [number, number]) => degree.set(key(p), (degree.get(key(p)) ?? 0) + 1);

  for (const p of paths) {
    if (p.kind === "line") {
      bump(p.a);
      bump(p.b);
    } else if (p.kind === "arc") {
      const rad = Math.PI / 180;
      bump([p.c[0] + p.r * Math.cos(p.start * rad), p.c[1] + p.r * Math.sin(p.start * rad)]);
      bump([p.c[0] + p.r * Math.cos(p.end * rad), p.c[1] + p.r * Math.sin(p.end * rad)]);
    }
  }

  return [...degree.values()].every((d) => d === 2);
}
