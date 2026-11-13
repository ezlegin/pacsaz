"use client";

import { parseDocument, render, toFoldSVG } from "@repo/dieline-engine";
import { DielineViewer } from "@repo/dieline-3d/viewer";
import { Button } from "@repo/ui/components/button";
import { Box } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

/** The catalogue's angle: from the front left, a little above, so a lid and two walls show. */
const CAMERA: [number, number, number] = [-0.8, 0.62, 1];
/** The model image is square, this many pixels a side. */
export const SIZE = 1024;
/** A very light neutral grey behind the model. */
export const BACKGROUND = "#f4f4f4";
/** How much of the square the model's longer side fills; the rest is margin. */
export const FILL = 0.7;
/** Time for the model to be framed and drawn after it is built. */
const SETTLE_MS = 700;

type Source = {
  specification: string;
  defaultMaterial: string;
  settings: { width: number; length: number; height: number; thickness: number; material: string } | null;
};

/**
 * Takes the dieline's model image from its own 3D model: fully closed, at the
 * template's saved size and material, centred on light grey, square. The model is drawn off
 * screen and handed back as a file, so the form uploads it like a picked one.
 */
export default function ModelCapture({ dieline, onCapture }: { dieline: Source; onCapture: (file: File) => void }) {
  const [active, setActive] = useState(false);

  const model = useMemo(() => {
    if (!active || !dieline.settings) return null;
    try {
      const parsed = parseDocument(JSON.parse(dieline.specification));
      if (!parsed.ok) return null;
      const s = dieline.settings;
      const result = render(parsed.document, { width: s.width, length: s.length, height: s.height, thickness: s.thickness, bleed: 0 });
      const folds = parsed.document.folds;
      return {
        svg: toFoldSVG(result),
        foldConfig: folds ? JSON.stringify({ version: 1, ...folds }) : null,
        thickness: s.thickness,
        material: s.material || dieline.defaultMaterial,
      };
    } catch {
      return null;
    }
  }, [active, dieline]);

  useEffect(() => {
    if (active && !model) {
      toast.error("This dieline has no 3D model to capture yet. Save it in the editor first.");
      setActive(false);
    }
  }, [active, model]);

  return (
    <>
      <Button type="button" variant="outline" size="sm" disabled={active || !dieline.settings} onClick={() => setActive(true)} className="w-full">
        <Box />
        {active ? "Capturing…" : "Capture from 3D"}
      </Button>
      {active && model && (
        <Shot
          {...model}
          onDone={(file) => {
            setActive(false);
            if (file) onCapture(file);
            else toast.error("The 3D model could not be captured.");
          }}
        />
      )}
    </>
  );
}

function Shot({
  svg,
  foldConfig,
  thickness,
  material,
  onDone,
}: {
  svg: string;
  foldConfig: string | null;
  thickness: number;
  material: string;
  onDone: (file: File | null) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  // The latest callback, so a parent re-render never restarts the timers.
  const finish = useRef(onDone);
  finish.current = onDone;
  const [built, setBuilt] = useState(false);

  useEffect(() => {
    if (!built) return;
    const timer = window.setTimeout(() => {
      if (done.current) return;
      done.current = true;
      const canvas = box.current?.querySelector("canvas");
      if (!canvas) return finish.current(null);
      // The 3D view frames the model by its bounds, not by what shows from this
      // angle, so it can sit off centre. The canvas is transparent around the
      // model: find the drawn pixels and centre them, the same size in every image.
      const src = document.createElement("canvas");
      src.width = canvas.width;
      src.height = canvas.height;
      const sctx = src.getContext("2d", { willReadFrequently: true })!;
      sctx.drawImage(canvas, 0, 0);
      const { data, width, height } = sctx.getImageData(0, 0, src.width, src.height);
      let x0 = width, y0 = height, x1 = -1, y1 = -1;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (data[(y * width + x) * 4 + 3]! > 8) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      }
      if (x1 < 0) return finish.current(null);
      const w = x1 - x0 + 1;
      const h = y1 - y0 + 1;
      const scale = (SIZE * FILL) / Math.max(w, h);

      const out = document.createElement("canvas");
      out.width = SIZE;
      out.height = SIZE;
      const ctx = out.getContext("2d")!;
      ctx.fillStyle = BACKGROUND;
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(src, x0, y0, w, h, (SIZE - w * scale) / 2, (SIZE - h * scale) / 2, w * scale, h * scale);
      // WebP keeps it well under the server action's body limit.
      out.toBlob((blob) => finish.current(blob ? new File([blob], "model.webp", { type: "image/webp" }) : null), "image/webp", 0.92);
    }, SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [built]);

  // Never fails silently: give up if the model is not built in time.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (done.current) return;
      done.current = true;
      finish.current(null);
    }, 15000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div ref={box} aria-hidden style={{ position: "fixed", left: -10000, top: 0, width: SIZE, height: SIZE, pointerEvents: "none" }}>
      <DielineViewer
        svg={svg}
        material={material}
        thickness={thickness}
        progress={1}
        foldConfig={foldConfig}
        cameraDirection={CAMERA}
        capture
        onModelInfo={() => setBuilt(true)}
        className="h-full w-full"
      />
    </div>
  );
}
