"use client";

import { evaluateExpression, formatNumber, offsetExpr } from "@repo/dieline-engine";
import { cn } from "@repo/ui/lib/utils";
import { CircleAlert } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { applyCompletion, completionsAt, type Completion } from "../model/completions";
import { useEditor, useStore } from "../state/react";

export type ExpressionBinding = {
  value: string;
  /** Live update while typing (inside the field's edit gesture). */
  set: (value: string) => void;
  /** Error from the last render for exactly this field, if any. */
  error?: string;
};

type Props = {
  binding: ExpressionBinding;
  /** Short label shown inside the field; drag it to scrub the value. */
  label?: string;
  placeholder?: string;
  /** Node being edited, so autocomplete does not offer it to itself. */
  selfId?: string;
  /** Hide the "= value" readout (for conditions, names, ...). */
  showValue?: boolean;
  className?: string;
};

const KIND_STYLE: Record<Completion["kind"], string> = {
  builtin: "text-sky-600",
  param: "text-violet-600",
  variable: "text-emerald-600",
  function: "text-amber-600",
  node: "text-blue-600",
  anchor: "text-pink-600",
  scalar: "text-pink-600",
  axis: "text-pink-600",
};

/**
 * The field every dimension in the editor goes through.
 *
 * - Edits apply live; focusing starts an undo gesture and blurring ends it, so a
 *   whole edit is one undo step. Escape restores the value it had on focus.
 * - Autocomplete offers variables, params, functions and `@node.anchor`
 *   references (Ctrl+Space to open it on an empty word).
 * - The evaluated value shows on the right; an error turns the field red and
 *   explains itself on hover.
 * - Dragging the label scrubs the value by adjusting its constant (Shift ×10,
 *   Alt ×0.1), the same way a canvas drag does.
 */
export function ExpressionInput({ binding, label, placeholder, selfId, showValue = true, className }: Props) {
  const store = useStore();
  const result = useEditor((s) => s.result);
  const doc = useEditor((s) => s.doc);

  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(binding.value);
  const [items, setItems] = useState<Completion[]>([]);
  const [active, setActive] = useState(0);
  const [menuAt, setMenuAt] = useState<{ left: number; top: number; width: number } | null>(null);
  const pendingCaret = useRef<number | null>(null);

  // Follow outside changes (canvas drags, undo) while not being typed in.
  useEffect(() => {
    if (!focused) setText(binding.value);
  }, [binding.value, focused]);

  useLayoutEffect(() => {
    if (pendingCaret.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(pendingCaret.current, pendingCaret.current);
      pendingCaret.current = null;
    }
  });

  const evaluated = useMemo(
    () => (showValue && text.trim() !== "" ? evaluateExpression(result, text) : null),
    [showValue, text, result],
  );
  const error = binding.error ?? (evaluated?.error && text.trim() !== "" ? evaluated.error : undefined);
  const isPlainNumber = /^\s*-?(\d+\.?\d*|\.\d+)\s*$/.test(text);

  const refresh = (value: string, caret: number, force = false) => {
    const next = completionsAt(value, caret, { doc, result, selfId }, force);
    setItems(next);
    setActive(0);
    const rect = inputRef.current?.getBoundingClientRect();
    setMenuAt(rect ? { left: rect.left, top: rect.bottom + 2, width: Math.max(rect.width, 220) } : null);
  };

  const update = (value: string, caret?: number) => {
    setText(value);
    binding.set(value);
    if (caret !== undefined) refresh(value, caret);
  };

  const accept = (c: Completion) => {
    const next = applyCompletion(text, c);
    pendingCaret.current = next.caret;
    update(next.text);
    // Keep completing into the next part of a reference (`@side.` → anchors).
    if (c.insert.endsWith(".")) refresh(next.text, next.caret);
    else setItems([]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (items.length) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => (a + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        accept(items[active]!);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setItems([]);
        return;
      }
    }

    if (e.key === " " && e.ctrlKey) {
      e.preventDefault();
      refresh(text, e.currentTarget.selectionStart ?? text.length, true);
      return;
    }
    if (e.key === "Enter") {
      e.currentTarget.blur();
      return;
    }
    if (e.key === "Escape") {
      store.cancel();
      setText(binding.value);
      e.currentTarget.blur();
      return;
    }
    // Arrow keys step plain numbers, like a number field.
    if ((e.key === "ArrowUp" || e.key === "ArrowDown") && isPlainNumber) {
      e.preventDefault();
      const step = (e.shiftKey ? 10 : e.altKey ? 0.1 : 1) * (e.key === "ArrowUp" ? 1 : -1);
      update(offsetExpr(text, step));
    }
  };

  //! Scrubbing the label --------------------------------------------------------

  const scrub = useRef<{ x: number; start: string } | null>(null);

  const onScrubDown = (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    store.begin();
    scrub.current = { x: e.clientX, start: binding.value };
  };

  const onScrubMove = (e: ReactPointerEvent<HTMLSpanElement>) => {
    const s = scrub.current;
    if (!s) return;
    const factor = e.shiftKey ? 5 : e.altKey ? 0.05 : 0.5;
    const delta = Math.round((e.clientX - s.x) * factor * 100) / 100;
    const next = offsetExpr(s.start || "0", delta);
    setText(next);
    binding.set(next);
  };

  const onScrubUp = () => {
    if (!scrub.current) return;
    scrub.current = null;
    store.end();
  };

  return (
    <div
      className={cn(
        "group/expr relative flex h-7 min-w-0 items-center rounded-md border bg-background text-xs transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20",
        error && "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/20",
        className,
      )}
      title={error}
    >
      {label && (
        <span
          className="flex h-full shrink-0 cursor-ew-resize select-none items-center pl-2 pr-1 text-[11px] text-muted-foreground"
          onPointerDown={onScrubDown}
          onPointerMove={onScrubMove}
          onPointerUp={onScrubUp}
          onPointerCancel={onScrubUp}
        >
          {label}
        </span>
      )}
      <input
        ref={inputRef}
        value={text}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent px-1.5 font-mono text-[11.5px] outline-none placeholder:text-muted-foreground/60",
          !label && "pl-2",
        )}
        onFocus={() => {
          setFocused(true);
          store.begin();
        }}
        onBlur={() => {
          setFocused(false);
          setItems([]);
          store.end();
        }}
        onChange={(e) => update(e.target.value, e.target.selectionStart ?? e.target.value.length)}
        onKeyDown={onKeyDown}
      />
      {error ? (
        <CircleAlert className="mr-1.5 size-3.5 shrink-0 text-red-500" />
      ) : (
        evaluated?.value !== undefined &&
        !isPlainNumber && (
          <span className="max-w-[40%] shrink-0 truncate pr-1.5 font-mono text-[11px] text-muted-foreground tabular-nums">
            = {formatNumber(evaluated.value, 2)}
          </span>
        )
      )}

      {focused && items.length > 0 && menuAt && (
        <ul
          className="fixed z-50 max-h-64 overflow-y-auto rounded-md border bg-popover p-1 text-xs shadow-lg"
          style={{ left: menuAt.left, top: menuAt.top, width: menuAt.width }}
          // Keep focus in the input while clicking an item.
          onPointerDown={(e) => e.preventDefault()}
        >
          {items.map((c, i) => (
            <li
              key={`${c.kind}:${c.insert}`}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded px-2 py-1",
                i === active && "bg-accent",
              )}
              onPointerEnter={() => setActive(i)}
              onClick={() => accept(c)}
            >
              <span className={cn("w-12 shrink-0 text-[10px] uppercase", KIND_STYLE[c.kind])}>{c.kind}</span>
              <span className="truncate font-mono">{c.label}</span>
              {c.detail && <span className="ml-auto shrink-0 truncate pl-2 text-muted-foreground">{c.detail}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
