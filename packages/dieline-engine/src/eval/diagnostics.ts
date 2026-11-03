/**
 * Everything that went wrong during a render. The renderer never throws: each
 * problem is pinned to what caused it so the editor can underline the exact
 * field, and the rest of the dieline still renders.
 */
export type Diagnostic = {
  severity: "error" | "warning";
  message: string;
  /** What the problem belongs to. */
  target:
    | { type: "node"; id: string; field?: string }
    | { type: "variable"; name: string; field?: string }
    | { type: "param"; name: string }
    | { type: "ruler"; id: string; field?: string }
    | { type: "document" };
};

export class Diagnostics {
  readonly list: Diagnostic[] = [];

  error(target: Diagnostic["target"], message: string) {
    this.list.push({ severity: "error", target, message });
  }

  warn(target: Diagnostic["target"], message: string) {
    this.list.push({ severity: "warning", target, message });
  }
}
