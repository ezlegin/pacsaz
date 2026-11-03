"use client";

import { cn } from "@repo/ui/lib/utils";
import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";
import { SIZE_LABELS, useAnalysis, type SizedIssue } from "../state/analysis";
import { useEditor, useStore } from "../state/react";

const CODE_LABELS: Record<SizedIssue["code"], string> = {
  gap: "Gap in the cut",
  openCut: "Open cut",
  doubleKnife: "Double knife",
  crossing: "Crossing lines",
  danglingFold: "Loose fold",
  tinySegment: "Tiny segment",
};

/**
 * Design checks and engine errors in one list. Clicking an issue selects the
 * shapes involved and zooms to the spot.
 */
export function IssuesPanel() {
  const store = useStore();
  const { issues } = useAnalysis();
  const diagnostics = useEditor((s) => s.result.diagnostics);
  const nodes = useEditor((s) => s.result.nodes);
  const range = useEditor((s) => s.sizeRange);

  const show = (issue: SizedIssue) => {
    if (issue.size === "current") {
      const ids = issue.nodeIds.filter((id) => nodes[id]);
      if (ids.length) {
        store.setScope(nodes[ids[0]!]?.parentId ?? null);
        store.select(ids);
      }
    } else {
      // The spot is at another size: show it there.
      store.setDisplay({ ghosts: true });
    }
    const r = 25;
    store.requestFitBounds({ minX: issue.at[0] - r, maxX: issue.at[0] + r, minY: issue.at[1] - r, maxY: issue.at[1] + r });
  };

  const errors = diagnostics.filter((d) => d.severity === "error");
  const nothing = issues.length === 0 && errors.length === 0;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-2 text-xs">
      {nothing && (
        <div className="flex flex-col items-center gap-2 px-3 py-8 text-center text-muted-foreground">
          <CircleCheck className="size-6 text-emerald-500" />
          <p>No problems found{range ? " at the preview, smallest or largest size" : ""}.</p>
          {!range && <p className="text-[11px]">Set the template&apos;s size range to check its extremes too.</p>}
        </div>
      )}

      {errors.length > 0 && (
        <div className="mb-2 space-y-1">
          <div className="px-1 text-[10px] font-semibold uppercase text-muted-foreground">Expression errors</div>
          {errors.map((d, i) => {
            const id = d.target.type === "node" ? d.target.id : null;
            return (
              <button
                key={i}
                type="button"
                className="flex w-full gap-2 rounded-md border border-red-200 bg-red-50/60 p-2 text-left hover:bg-red-50"
                onClick={() => {
                  if (!id || !nodes[id]) return;
                  store.setScope(nodes[id]!.parentId);
                  store.select([id]);
                }}
              >
                <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-red-500" />
                <span>
                  <b className="font-mono">{id ? (nodes[id]?.name ?? id) : d.target.type === "variable" ? d.target.name : d.target.type}</b>
                  {d.target.type !== "document" && "field" in d.target && d.target.field ? <span className="text-muted-foreground"> · {d.target.field}</span> : null}
                  <span className="block text-red-700">{d.message}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {(["current", "min", "max"] as const).map((size) => {
        const list = issues.filter((i) => i.size === size);
        if (!list.length) return null;
        return (
          <div key={size} className="mb-2 space-y-1">
            <div className="px-1 text-[10px] font-semibold uppercase text-muted-foreground">{SIZE_LABELS[size]}</div>
            {list.map((issue, i) => {
              const Icon = issue.severity === "error" ? CircleAlert : TriangleAlert;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => show(issue)}
                  className={cn(
                    "flex w-full gap-2 rounded-md border p-2 text-left",
                    issue.severity === "error" ? "border-red-200 hover:bg-red-50" : "border-amber-200 hover:bg-amber-50",
                  )}
                >
                  <Icon className={cn("mt-0.5 size-3.5 shrink-0", issue.severity === "error" ? "text-red-500" : "text-amber-500")} />
                  <span>
                    <b>{CODE_LABELS[issue.code]}</b>
                    <span className="block text-muted-foreground">{issue.message}</span>
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/** Count for the tab label: errors first, so a clean template reads as clean. */
export function useIssueCount(): { errors: number; warnings: number } {
  const { issues } = useAnalysis();
  const diagnostics = useEditor((s) => s.result.diagnostics);
  return {
    errors: issues.filter((i) => i.severity === "error").length + diagnostics.filter((d) => d.severity === "error").length,
    warnings: issues.filter((i) => i.severity === "warning").length,
  };
}
