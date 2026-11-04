import { duplicateNodes, findNode, removeNodes, toDXF, toSVG } from "@repo/dieline-engine";
import { SHAPE_LABELS, type PlaceableKind } from "./model/create";
import { groupNodes, ungroupNodes } from "./model/ops";
import type { EditorStore } from "./state/store";

export type Command = {
  id: string;
  label: string;
  group: string;
  keys?: string;
  run: () => void;
  enabled?: boolean;
};

export type CommandHost = {
  save?: () => void;
  download: (name: string, content: string, type: string) => void;
};

/**
 * Everything the command palette (Ctrl+K) can do. Built on demand from the
 * current state, so disabled commands can say so and node names stay current.
 */
export function buildCommands(store: EditorStore, host: CommandHost): Command[] {
  const s = store.get();
  const sel = s.selection;
  const kinds: PlaceableKind[] = ["rect", "line", "triangle", "ellipse", "arc", "polygon", "star", "belt"];

  const commands: Command[] = [
    ...(host.save ? [{ id: "save", label: "Save", group: "File", keys: "Ctrl+S", run: host.save, enabled: s.dirty }] : []),
    {
      id: "export-svg",
      label: "Export SVG",
      group: "File",
      run: () => host.download("dieline.svg", toSVG(s.result, { includeRulers: true, ...(s.display.nicks ? { nicks: s.nicks } : {}) }), "image/svg+xml"),
    },
    { id: "export-dxf", label: "Export DXF (die maker layers)", group: "File", run: () => host.download("dieline.dxf", toDXF(s.result, s.display.nicks ? { nicks: s.nicks } : {}), "application/dxf") },

    { id: "undo", label: "Undo", group: "Edit", keys: "Ctrl+Z", run: () => store.undo(), enabled: s.canUndo },
    { id: "redo", label: "Redo", group: "Edit", keys: "Ctrl+Shift+Z", run: () => store.redo(), enabled: s.canRedo },
    {
      id: "duplicate",
      label: "Duplicate selection",
      group: "Edit",
      keys: "Ctrl+D",
      enabled: sel.length > 0,
      run: () => {
        const { doc, ids } = duplicateNodes(store.get().doc, sel);
        store.apply(() => doc, ids);
      },
    },
    { id: "delete", label: "Delete selection", group: "Edit", keys: "Del", enabled: sel.length > 0, run: () => store.apply((d) => removeNodes(d, sel), []) },
    {
      id: "group",
      label: "Group selection",
      group: "Edit",
      keys: "Ctrl+G",
      enabled: sel.length > 0,
      run: () => {
        const r = groupNodes(store.get().doc, store.get().result, sel);
        if (r) store.apply(() => r.doc, [r.id]);
      },
    },
    {
      id: "ungroup",
      label: "Ungroup",
      group: "Edit",
      keys: "Ctrl+Shift+G",
      enabled: sel.some((id) => findNode(s.doc, id)?.node.kind === "group"),
      run: () => {
        const r = ungroupNodes(store.get().doc, sel);
        if (r) store.apply(() => r.doc, r.ids);
      },
    },
    { id: "select-all", label: "Select all", group: "Edit", keys: "Ctrl+A", run: () => store.select(Object.values(s.result.nodes).filter((n) => (n.parentId ?? null) === s.scope).map((n) => n.id)) },

    { id: "tool-select", label: "Select tool", group: "Tools", keys: "V", run: () => store.setTool("select") },
    { id: "tool-pen", label: "Pen tool", group: "Tools", keys: "P", run: () => store.setTool("pen") },
    { id: "tool-measure", label: "Measure tool", group: "Tools", keys: "M", run: () => store.setTool("measure") },
    ...kinds.map((k) => ({ id: `tool-${k}`, label: `Draw ${SHAPE_LABELS[k].toLowerCase()}`, group: "Tools", run: () => store.setTool("place", k) })),

    { id: "fit", label: "Fit dieline to screen", group: "View", keys: "Shift+/", run: () => store.requestFit() },
    { id: "fit-sel", label: "Zoom to selection", group: "View", keys: "Shift+2", enabled: sel.length > 0, run: () => store.requestFit(sel) },
    { id: "snap", label: s.snapping ? "Turn snapping off" : "Turn snapping on", group: "View", keys: "S", run: () => store.setSnapping(!s.snapping) },
    { id: "guides", label: s.display.guides ? "Hide guides" : "Show guides", group: "View", run: () => store.setDisplay({ guides: !s.display.guides }) },
    { id: "overall", label: s.display.overall ? "Hide overall rulers" : "Show overall rulers", group: "View", run: () => store.setDisplay({ overall: !s.display.overall }) },
    { id: "bleed", label: s.display.bleed ? "Hide bleed" : "Show bleed", group: "View", run: () => store.setDisplay({ bleed: !s.display.bleed }) },
    { id: "ghosts", label: s.display.ghosts ? "Hide smallest/largest sizes" : "Show smallest/largest sizes", group: "View", enabled: !!s.sizeRange, run: () => store.setDisplay({ ghosts: !s.display.ghosts }) },
    { id: "nicks", label: s.display.nicks ? "Turn nicks off" : "Turn nicks on", group: "View", run: () => store.setDisplay({ nicks: !s.display.nicks }) },
    { id: "issues", label: s.display.issues ? "Hide problem markers" : "Show problem markers", group: "View", run: () => store.setDisplay({ issues: !s.display.issues }) },
    { id: "preview3d", label: s.display.preview3d ? "Close 3D preview" : "Open 3D preview", group: "View", run: () => store.setDisplay({ preview3d: !s.display.preview3d }) },
  ];

  // Jump to any node by name.
  for (const info of Object.values(s.result.nodes)) {
    commands.push({
      id: `goto-${info.id}`,
      label: info.name,
      group: "Go to",
      run: () => {
        store.setScope(info.parentId);
        store.select([info.id]);
        store.requestFit([info.id]);
      },
    });
  }

  return commands;
}

export function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}
