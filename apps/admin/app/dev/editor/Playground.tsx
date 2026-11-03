"use client";

import { rteBox } from "@repo/dieline-engine/fixtures";
import { EditorStore, Studio } from "@repo/editor";
import { useEffect, useState } from "react";

/** A size range like a real template has, so ghosts and checks have something to show. */
const SIZE_RANGE = {
  min: { width: 40, length: 40, height: 50 },
  max: { width: 200, length: 160, height: 260 },
};

/** The full Studio on the reverse tuck end box body, with nothing saved. */
export default function Playground() {
  const [store] = useState(
    () => new EditorStore(rteBox, { width: 100, length: 60, height: 120, thickness: 0.5 }),
  );

  // Handy from the browser console while developing the editor.
  useEffect(() => {
    (window as unknown as { __editor: EditorStore }).__editor = store;
  }, [store]);

  return <Studio store={store} title="Playground · reverse tuck end" sizeRange={SIZE_RANGE} />;
}
