import type { EditorStore } from "./store";

const KEY = "pacsaz.editor.view";
const TOGGLES = ["grid", "guides", "overall", "bleed", "ghosts", "nicks", "issues", "preview3d"] as const;

type Preferences = { snapping: boolean } & Record<(typeof TOGGLES)[number], boolean>;

/** Keeps only known on/off values, so a stale or edited entry cannot break the editor. */
export function parsePreferences(json: string | null): Partial<Preferences> {
  try {
    const saved = JSON.parse(json ?? "{}") as Record<string, unknown>;
    return Object.fromEntries(["snapping", ...TOGGLES].filter((k) => typeof saved[k] === "boolean").map((k) => [k, saved[k]]));
  } catch {
    return {};
  }
}

/**
 * The top bar's on/off choices belong to the person, not the template, so they
 * live in this browser and follow them from one dieline to the next. Storage can
 * be blocked, in which case the editor just starts with its defaults.
 */
export function persistPreferences(store: EditorStore): () => void {
  try {
    const { snapping, ...display } = parsePreferences(localStorage.getItem(KEY));
    if (snapping !== undefined) store.setSnapping(snapping);
    store.setDisplay(display);
  } catch {
    // Nothing saved can be read.
  }

  let last = "";
  return store.subscribe(() => {
    const { snapping, display } = store.get();
    const next = JSON.stringify({ snapping, ...Object.fromEntries(TOGGLES.map((k) => [k, display[k]])) });
    if (next === last) return;
    last = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Not saved; the choice still applies until the page closes.
    }
  });
}
