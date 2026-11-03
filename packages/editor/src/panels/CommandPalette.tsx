"use client";

import { Dialog, DialogContent, DialogTitle } from "@repo/ui/components/dialog";
import { cn } from "@repo/ui/lib/utils";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Command } from "../commands";

/** Ctrl+K: type to find any command or jump to a node. */
export function CommandPalette({
  open,
  onOpenChange,
  commands,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: () => Command[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="top-[20%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        {open && <Palette commands={commands()} close={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function Palette({ commands, close }: { commands: Command[]; close: () => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = commands.filter((c) => c.enabled !== false);
    if (!q) return list.filter((c) => c.group !== "Go to");
    // Every word must appear, in the label or the group.
    const words = q.split(/\s+/);
    return list.filter((c) => words.every((w) => `${c.label} ${c.group}`.toLowerCase().includes(w))).slice(0, 50);
  }, [commands, query]);

  const run = (c: Command | undefined) => {
    if (!c) return;
    close();
    // Let the dialog close (and return focus) before the command acts.
    setTimeout(c.run, 0);
  };

  let lastGroup = "";

  return (
    <div className="text-sm">
      <div className="flex items-center gap-2 border-b px-3">
        <Search className="size-4 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          placeholder="Search commands and shapes…"
          className="h-11 flex-1 bg-transparent outline-none"
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              const n = matches.length || 1;
              setActive((a) => (a + (e.key === "ArrowDown" ? 1 : -1) + n) % n);
            }
            if (e.key === "Enter") run(matches[active]);
          }}
        />
      </div>
      <ul className="max-h-80 overflow-y-auto p-1">
        {matches.length === 0 && <li className="px-3 py-6 text-center text-muted-foreground">No matches</li>}
        {matches.map((c, i) => {
          const header = c.group !== lastGroup ? c.group : null;
          lastGroup = c.group;
          return (
            <li key={c.id}>
              {header && <div className="px-2 pb-1 pt-2 text-[11px] font-medium uppercase text-muted-foreground">{header}</div>}
              <button
                type="button"
                className={cn("flex w-full items-center rounded px-2 py-1.5 text-left", i === active && "bg-accent")}
                onPointerEnter={() => setActive(i)}
                onClick={() => run(c)}
              >
                <span className={cn(c.group === "Go to" && "font-mono text-xs")}>{c.label}</span>
                {c.keys && <kbd className="ml-auto text-[11px] text-muted-foreground">{c.keys}</kbd>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
