"use client";

import { ISpec } from "@repo/store/types";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  /** Node the rules belong to, used only for the dialog description. */
  nodeKey: string;
  initialRules: ISpec.NodeRule[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (rules: ISpec.NodeRule[]) => void;
}

const emptyRule = (): ISpec.NodeRule => ({
  id: nanoid(),
  condition: "",
  action: "hide",
});

/** A bare `1`/`0` is not a useful condition and would hide the node by accident. */
const isUsableCondition = (value: string) => value.trim().length > 0;

export function NodeRulesDialog({
  open,
  nodeKey,
  initialRules,
  onOpenChange,
  onSubmit,
}: Props) {
  const [rules, setRules] = useState<ISpec.NodeRule[]>([]);

  useEffect(() => {
    if (!open) return;
    setRules(initialRules.length > 0 ? initialRules : [emptyRule()]);
  }, [open, initialRules]);

  const updateRule = (id: string, changes: Partial<ISpec.NodeRule>) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, ...changes } : rule)),
    );
  };

  const addRule = () => setRules((prev) => [...prev, emptyRule()]);

  const removeRule = (id: string) =>
    setRules((prev) => prev.filter((rule) => rule.id !== id));

  /** Order decides which rule wins, so it has to be editable. */
  const moveRule = (index: number, direction: -1 | 1) => {
    setRules((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;

      const next = [...prev];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  };

  /**
   * A rule with an empty condition is simply skipped, so the only invalid state is
   * a half-typed one. Zero rules is valid and means "save, with no rules" — the
   * way to strip every rule from a node.
   */
  const hasIncompleteRule = rules.some(
    (rule) => !isUsableCondition(rule.condition),
  );
  const canSubmit = !hasIncompleteRule;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(
      rules.map((rule) => ({ ...rule, condition: rule.condition.trim() })),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Visibility Rules</DialogTitle>
          <DialogDescription>
            Applied in order to{" "}
            <span className="font-medium text-foreground">{nodeKey}</span> — the
            last matching rule wins, so a later Show can override an earlier
            Hide. Conditions are evaluated against the dieline scope:{" "}
            <code className="text-xs">width</code>,{" "}
            <code className="text-xs">length</code>,{" "}
            <code className="text-xs">height</code>,{" "}
            <code className="text-xs">safeOffset</code> and your variables.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {rules.map((rule, idx) => (
            <div key={rule.id} className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`rule-condition-${rule.id}`}>
                  {idx === 0 ? "If" : "Else if"}
                </Label>
                <Input
                  id={`rule-condition-${rule.id}`}
                  placeholder="width > 100"
                  value={rule.condition}
                  onChange={(e) =>
                    updateRule(rule.id, { condition: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  autoFocus={idx === 0}
                />
              </div>

              <div className="space-y-2">
                <Label>Then</Label>
                <ToggleGroup
                  type="single"
                  value={rule.action}
                  onValueChange={(v) => {
                    if (!v) return;
                    updateRule(rule.id, {
                      action: v as ISpec.NodeRule["action"],
                    });
                  }}
                  variant="outline"
                >
                  <ToggleGroupItem value="hide" className="h-9 px-3">
                    Hide
                  </ToggleGroupItem>
                  <ToggleGroupItem value="show" className="h-9 px-3">
                    Show
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="flex gap-0.5">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground"
                  disabled={idx === 0}
                  onClick={() => moveRule(idx, -1)}
                  title="Move up"
                >
                  <ChevronUp />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground"
                  disabled={idx === rules.length - 1}
                  onClick={() => moveRule(idx, 1)}
                  title="Move down"
                >
                  <ChevronDown />
                </Button>
              </div>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => removeRule(rule.id)}
                title="Remove rule"
              >
                <Minus />
              </Button>
            </div>
          ))}

          {rules.length === 0 && (
            <p className="rounded-md border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
              No rules. This node is always shown unless hidden by hand.
            </p>
          )}

          <Button type="button" size="sm" variant="outline" onClick={addRule}>
            <Plus />
            Add Rule
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            Save Rules
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

