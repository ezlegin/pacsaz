"use client";

import { removeNodes, type DielineDocument } from "@repo/dieline-engine";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/utils";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Canvas } from "./canvas/Canvas";
import { buildCommands, downloadFile } from "./commands";
import { CommandPalette } from "./panels/CommandPalette";
import { DocumentPanel } from "./panels/DocumentPanel";
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

const TOOL_KEYS: Record<string, [Tool, ("rect" | "line" | "ellipse")?]> = {
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

function StudioLayout({ title, leading, trailing, onSave, onError }: StudioProps) {
  const store = useStore();
  const [palette, setPalette] = useState(false);
  const [saving, setSaving] = useState(false);
  const display = useEditor((s) => s.display);

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
      if (isEditable(target) || target?.closest("[data-editor-canvas]") || palette) return;

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
  }, [store, save, palette]);

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
      <TopBar title={title} leading={leading} trailing={trailing} onSave={onSave ? save : undefined} saving={saving} onPalette={() => setPalette(true)} />
      <div className="flex min-h-0 flex-1">
        <ToolRail />
        <aside className="flex w-60 shrink-0 flex-col border-r bg-muted/20">
          <div className="flex h-8 shrink-0 items-center border-b px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Layers
          </div>
          <Outline />
        </aside>
        <main className="relative min-w-0 flex-1" data-editor-canvas>
          <Canvas className="h-full w-full" showGuides={display.guides} showRulers={display.rulers} />
        </main>
        <Inspector />
      </div>
      <CommandPalette
        open={palette}
        onOpenChange={setPalette}
        commands={() => buildCommands(store, { save: onSave ? () => void save() : undefined, download: downloadFile })}
      />
    </div>
  );
}

/** Right panel: the selected node's properties, or the document's. */
function Inspector() {
  const selection = useEditor((s) => s.selection);
  const [tab, setTab] = useState<"design" | "document">("design");
  const single = selection.length === 1 ? selection[0]! : null;

  // Selecting something brings its properties forward.
  useEffect(() => {
    if (single) setTab("design");
  }, [single]);

  const showing = single && tab === "design" ? "design" : "document";

  return (
    <aside className="flex w-[340px] shrink-0 flex-col border-l bg-background">
      <div className="flex h-8 shrink-0 border-b text-[11px] font-semibold uppercase tracking-wide">
        {(["design", "document"] as const).map((t) => (
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
            {t === "design" ? "Shape" : "Template"}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {showing === "design" && single ? (
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
