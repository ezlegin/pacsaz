"use client";

import { rteBox } from "@repo/dieline-engine/fixtures";
import { EditorStore, Studio } from "@repo/editor";
import { useEffect, useState } from "react";

/** The full Studio on the reverse tuck end box body, with nothing saved. */
export default function Playground() {
  const [store] = useState(
    () => new EditorStore(rteBox, { width: 100, length: 60, height: 120, thickness: 0.5 }),
  );

  // Handy from the browser console while developing the editor.
  useEffect(() => {
    (window as unknown as { __editor: EditorStore }).__editor = store;
  }, [store]);

  return <Studio store={store} title="Playground · reverse tuck end" />;
}
