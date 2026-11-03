import { render, type DielineDocument, type RenderInputs, type RenderResult } from "@repo/dieline-engine";

export type Tool = "select" | "measure" | "hand";

/** Screen pixel = world mm × zoom, with the Y axis flipped; `x`/`y` place world 0,0. */
export type View = { x: number; y: number; zoom: number };

export type EditorState = {
  doc: DielineDocument;
  inputs: RenderInputs;
  /** The engine's output for `doc` + `inputs`; always in sync with them. */
  result: RenderResult;
  /** Selected node ids, in selection order. */
  selection: string[];
  hover: string | null;
  /** The group the designer has entered; clicks select its direct children. */
  scope: string | null;
  tool: Tool;
  view: View;
  snapping: boolean;
  canUndo: boolean;
  canRedo: boolean;
};

const HISTORY_LIMIT = 200;

/**
 * The editor's single source of truth, shared by the canvas and (from Phase 3)
 * the panels. Plain TypeScript with a subscribe/get pair so React reads it with
 * `useSyncExternalStore` and tests can drive it without React.
 *
 * Document changes go through `apply`, which records undo history. A drag uses a
 * transaction instead: `begin()`, any number of `preview()` calls, then `end()`
 * records the whole drag as one undo step.
 */
export class EditorStore {
  private state: EditorState;
  private readonly listeners = new Set<() => void>();
  private past: DielineDocument[] = [];
  private future: DielineDocument[] = [];
  private transactionStart: DielineDocument | null = null;

  constructor(doc: DielineDocument, inputs: RenderInputs) {
    this.state = {
      doc,
      inputs,
      result: render(doc, inputs),
      selection: [],
      hover: null,
      scope: null,
      tool: "select",
      view: { x: 0, y: 0, zoom: 1 },
      snapping: true,
      canUndo: false,
      canRedo: false,
    };
  }

  get = (): EditorState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private set(patch: Partial<EditorState>) {
    const next = { ...this.state, ...patch };

    if (patch.doc !== undefined || patch.inputs !== undefined) {
      if (next.doc !== this.state.doc || next.inputs !== this.state.inputs) {
        next.result = render(next.doc, next.inputs);
        // Drop selections of nodes that no longer exist.
        next.selection = next.selection.filter((id) => next.result.nodes[id]);
        if (next.hover && !next.result.nodes[next.hover]) next.hover = null;
        if (next.scope && !next.result.nodes[next.scope]) next.scope = null;
      }
    }

    next.canUndo = this.past.length > 0;
    next.canRedo = this.future.length > 0;
    this.state = next;
    for (const listener of this.listeners) listener();
  }

  //! Document -----------------------------------------------------------------

  /** Replaces the document and forgets history (loading a template). */
  load(doc: DielineDocument) {
    this.past = [];
    this.future = [];
    this.transactionStart = null;
    this.set({ doc, selection: [], hover: null, scope: null });
  }

  /** Changes the document as one undoable step. */
  apply(fn: (doc: DielineDocument) => DielineDocument, selection?: string[]) {
    if (this.transactionStart) {
      this.preview(fn(this.state.doc));
      return;
    }

    const doc = fn(this.state.doc);
    if (doc === this.state.doc) return;

    this.past = [...this.past.slice(-(HISTORY_LIMIT - 1)), this.state.doc];
    this.future = [];
    this.set({ doc, ...(selection ? { selection } : {}) });
  }

  /** Starts a gesture whose intermediate states are not history. */
  begin() {
    if (!this.transactionStart) this.transactionStart = this.state.doc;
  }

  /** Shows an intermediate document during a gesture. */
  preview(doc: DielineDocument) {
    if (doc !== this.state.doc) this.set({ doc });
  }

  /** Ends a gesture, recording it as one step if anything changed. */
  end() {
    const start = this.transactionStart;
    this.transactionStart = null;
    if (start && start !== this.state.doc) {
      this.past = [...this.past.slice(-(HISTORY_LIMIT - 1)), start];
      this.future = [];
      this.set({});
    }
  }

  /** Abandons a gesture and restores where it started (Escape mid-drag). */
  cancel() {
    const start = this.transactionStart;
    this.transactionStart = null;
    if (start) this.set({ doc: start });
  }

  get inTransaction(): boolean {
    return this.transactionStart !== null;
  }

  /** The document as it was when the current gesture began. */
  get gestureStart(): DielineDocument {
    return this.transactionStart ?? this.state.doc;
  }

  undo() {
    if (this.transactionStart) this.cancel();
    const previous = this.past[this.past.length - 1];
    if (!previous) return;
    this.past = this.past.slice(0, -1);
    this.future = [this.state.doc, ...this.future];
    this.set({ doc: previous });
  }

  redo() {
    const next = this.future[0];
    if (!next) return;
    this.future = this.future.slice(1);
    this.past = [...this.past, this.state.doc];
    this.set({ doc: next });
  }

  setInputs(patch: Partial<RenderInputs>) {
    this.set({ inputs: { ...this.state.inputs, ...patch } });
  }

  //! Selection & view -----------------------------------------------------------

  select(ids: string[], mode: "replace" | "add" | "toggle" = "replace") {
    const current = this.state.selection;
    let selection: string[];

    if (mode === "replace") selection = ids;
    else if (mode === "add") selection = [...current, ...ids.filter((id) => !current.includes(id))];
    else {
      selection = [...current];
      for (const id of ids) {
        const at = selection.indexOf(id);
        if (at >= 0) selection.splice(at, 1);
        else selection.push(id);
      }
    }

    if (!sameList(selection, current)) this.set({ selection });
  }

  setHover(hover: string | null) {
    if (hover !== this.state.hover) this.set({ hover });
  }

  /** Enters a group so clicks reach its children, or leaves to the root with null. */
  setScope(scope: string | null) {
    if (scope !== this.state.scope) this.set({ scope });
  }

  setTool(tool: Tool) {
    if (tool !== this.state.tool) this.set({ tool });
  }

  setView(view: View) {
    const v = this.state.view;
    if (view.x !== v.x || view.y !== v.y || view.zoom !== v.zoom) this.set({ view });
  }

  setSnapping(snapping: boolean) {
    this.set({ snapping });
  }
}

function sameList(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
