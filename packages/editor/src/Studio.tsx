"use client";

import { removeNodes, type Customization, type DielineDocument, type Dimensions } from "@repo/dieline-engine";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/utils";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Canvas } from "./canvas/Canvas";
import { FoldPreview } from "./canvas/Preview3D";
import { Customizer } from "./customize/Customizer";
import { buildCommands, downloadFile } from "./commands";
import { groupNodes, ungroupNodes } from "./model/ops";
import { CommandPalette } from "./panels/CommandPalette";
import { DocumentPanel, PreviewSize } from "./panels/DocumentPanel";
import { IssuesPanel, useIssueCount } from "./panels/IssuesPanel";
import { NodeInspector } from "./panels/NodeInspector";
import { Outline } from "./panels/Outline";
import { ToolRail } from "./panels/ToolRail";
import { TopBar } from "./panels/TopBar";
import { EditorProvider, useEditor, useStore } from "./state/react";
import type { EditorStore, Tool } from "./state/store";

export type SaveResult = { ok: true } | { ok: false; error: string };

export type StudioProps = {
  store: EditorStore;
  title: ReactNode;
  /** Shown before the title (a back link). */
  leading?: ReactNode;
  /** Shown before the save button (app-specific actions). */
  trailing?: ReactNode;
  onSave?: (doc: DielineDocument) => Promise<SaveResult>;
  /** Called when a save fails, to show the error the app's way. */
  onError?: (message: string) => void;
  /**
   * The inspector's Settings tab: what the template is previewed at (size,
   * material, bleed, ...). Without it the tab holds plain size fields.
   */
  settings?: ReactNode;
  /** The smallest and largest sizes the template is sold in: drawn as ghosts and checked. */
  sizeRange?: { min: Dimensions; max: Dimensions } | null;
};

/**
 * The full editor: top bar, tool rail, outline, canvas and inspector around one
 * `EditorStore`. Apps provide the store and persistence; everything else is here.
 */
export function Studio(props: StudioProps) {
  return (
    <EditorProvider store={props.store}>
      <TooltipProvider delayDuration={400}>
        <StudioLayout {...props} />
      </TooltipProvider>
    </EditorProvider>
  );
}

const TOOL_KEYS: Record<string, [Tool, ("rect" | "line" | "ellipse" | "triangle")?]> = {
  t: ["place", "triangle"],
  v: ["select"],
  h: ["hand"],
  m: ["measure"],
  p: ["pen"],
  r: ["place", "rect"],
  l: ["place", "line"],
  e: ["place", "ellipse"],
};

function isEditable(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

function StudioLayout({ title, leading, trailing, onSave, onError, sizeRange, settings }: StudioProps) {
  const store = useStore();
  const [sidebar, setSidebar] = useState<"layers" | "checks">("layers");
  const issueCount = useIssueCount();

  useEffect(() => {
    store.setSizeRange(sizeRange ?? null);
  }, [store, sizeRange]);
  const [palette, setPalette] = useState(false);
  const [saving, setSaving] = useState(false);
  const display = useEditor((s) => s.display);
  // Customer preview: the template as a paying customer sees it. Trial changes are never saved.
  const [customerView, setCustomerView] = useState(false);
  const [trial, setTrial] = useState<Customization>({});

  const save = useCallback(async () => {
    if (!onSave || saving) return;
    const doc = store.get().doc;
    setSaving(true);
    try {
      const res = await onSave(doc);
      if (res.ok) store.markSaved(doc);
      else onError?.(res.error);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }, [onSave, onError, saving, store]);

  // Shortcuts that work anywhere in the editor. The canvas handles its own keys
  // while focused; these cover the panels, without stealing keys from inputs.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (mod && key === "k") {
        e.preventDefault();
        setPalette((p) => !p);
        return;
      }
      if (mod && key === "s") {
        e.preventDefault();
        void save();
        return;
      }

      const target = e.target as HTMLElement | null;
      if (isEditable(target) || palette || customerView) return;

      // Grouping is handled here only, wherever focus is, so the browser never
      // gets Ctrl+G (find next) and the canvas never groups a second time.
      if (mod && key === "g") {
        e.preventDefault();
        const { doc, result, selection } = store.get();
        const r = e.shiftKey ? ungroupNodes(doc, selection) : groupNodes(doc, result, selection);
        if (r) store.apply(() => r.doc, "id" in r ? [r.id] : r.ids);
        return;
      }
      if (target?.closest("[data-editor-canvas]")) return;

      if (mod && key === "z") {
        e.preventDefault();
        if (e.shiftKey) store.redo();
        else store.undo();
      } else if (mod && key === "y") {
        e.preventDefault();
        store.redo();
      } else if (!mod && (e.key === "Delete" || e.key === "Backspace")) {
        const sel = store.get().selection;
        if (sel.length) store.apply((d) => removeNodes(d, sel), []);
      } else if (!mod && e.key === "Escape") {
        store.select([]);
      } else if (!mod && !e.altKey && TOOL_KEYS[key]) {
        const [tool, kind] = TOOL_KEYS[key]!;
        store.setTool(tool, kind);
      } else if (!mod && (key === "f" || (e.shiftKey && e.code === "Slash"))) {
        store.requestFit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store, save, palette, customerView]);

  // Don't let unsaved work be lost to a closed tab.
  const dirty = useEditor((s) => s.dirty);
  useEffect(() => {
    if (!onSave || !dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [onSave, dirty]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <TopBar
        title={title}
        leading={leading}
        trailing={trailing}
        onSave={onSave ? save : undefined}
        saving={saving}
        onPalette={() => setPalette(true)}
        customerView={customerView}
        onCustomerView={setCustomerView}
      />
      {customerView ? (
        <CustomerPreview value={trial} onChange={setTrial} onClose={() => setCustomerView(false)} />
      ) : (
      <div className="flex min-h-0 flex-1">
        <ToolRail />
        <aside className="flex w-60 shrink-0 flex-col border-r bg-muted/20">
          <div className="flex h-8 shrink-0 border-b text-[11px] font-semibold uppercase tracking-wide">
            {(["layers", "checks"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSidebar(t)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 border-b-2 border-transparent text-muted-foreground hover:text-foreground",
                  sidebar === t && "border-blue-600 text-foreground",
                )}
              >
                {t === "layers" ? "Layers" : "Checks"}
                {t === "checks" && (issueCount.errors > 0 || issueCount.warnings > 0) && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px] font-semibold normal-case text-white",
                      issueCount.errors > 0 ? "bg-red-500" : "bg-amber-500",
                    )}
                  >
                    {issueCount.errors || issueCount.warnings}
                  </span>
                )}
              </button>
            ))}
          </div>
          {sidebar === "layers" ? <Outline /> : <IssuesPanel />}
        </aside>
        <main className="relative min-w-0 flex-1" data-editor-canvas>
          <Canvas className="h-full w-full" showGuides={display.guides} />
        </main>
        <Inspector settings={settings} />
      </div>
      )}
      <CommandPalette
        open={palette}
        onOpenChange={setPalette}
        commands={() => buildCommands(store, { save: onSave ? () => void save() : undefined, download: downloadFile })}
      />
    </div>
  );
}

/** The Customizer on the template being edited, so the designer sees exactly what customers get. */
function CustomerPreview({ value, onChange, onClose }: { value: Customization; onChange: (c: Customization) => void; onClose: () => void }) {
  const doc = useEditor((s) => s.doc);
  const inputs = useEditor((s) => s.inputs);
  const [fold, setFold] = useState(false);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-9 shrink-0 items-center gap-3 border-b bg-violet-600 px-3 text-xs text-white">
        <span className="font-semibold">Customer view</span>
        <span className="text-white/80">What a paying customer can change. Changes here are only a trial and are not saved.</span>
        <button type="button" className="ml-auto rounded px-2 py-1 hover:bg-white/15" onClick={() => setFold(!fold)}>
          {fold ? "Hide 3D" : "Show 3D"}
        </button>
        <button type="button" className="rounded px-2 py-1 hover:bg-white/15" onClick={onClose}>
          Back to editing
        </button>
      </div>
      <Customizer
        className="flex-1"
        template={doc}
        inputs={inputs}
        value={value}
        onChange={onChange}
        overlay={(result) => fold && <FoldPreview result={result} thickness={inputs.thickness} folds={doc.folds} onClose={() => setFold(false)} />}
      />
    </div>
  );
}

/** Right panel: the selected node's properties, or the document's. */
function Inspector({ settings }: { settings?: ReactNode }) {
  const selection = useEditor((s) => s.selection);
  const [tab, setTab] = useState<"design" | "document" | "settings">("design");
  const single = selection.length === 1 ? selection[0]! : null;

  // Selecting something brings its properties forward.
  useEffect(() => {
    if (single) setTab("design");
  }, [single]);

  const showing = tab === "settings" ? "settings" : single && tab === "design" ? "design" : "document";
  const tabs = ["design", "document", "settings"] as const;

  return (
    <aside className="flex w-[340px] shrink-0 flex-col border-l bg-background">
      <div className="flex h-8 shrink-0 border-b text-[11px] font-semibold uppercase tracking-wide">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            disabled={t === "design" && !single}
            className={cn(
              "flex-1 border-b-2 border-transparent text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40",
              showing === t && "border-blue-600 text-foreground",
            )}
          >
            {t === "design" ? "Shape" : t === "document" ? "Template" : "Settings"}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {showing === "settings" ? (
          (settings ?? <PreviewSize />)
        ) : showing === "design" && single ? (
          <NodeInspector key={single} id={single} />
        ) : (
          <>
            {selection.length > 1 && (
              <p className="border-b px-3 py-2 text-xs text-muted-foreground">{selection.length} shapes selected. Group them with Ctrl+G.</p>
            )}
            <DocumentPanel />
          </>
        )}
      </div>
    </aside>
  );
}
