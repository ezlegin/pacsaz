"use client";

import { parseDocument, render, toSVG } from "@repo/dieline-engine";
import { Button } from "@repo/ui/components/button";
import { PenTool } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BACKGROUND, SIZE } from "./ModelCapture";

/** A flat drawing has no depth to frame, so it fills more of the square than the model. */
const FILL = 0.88;
/** Line weight in the image, in pixels, whatever the dieline's size. */
const STROKE_PX = 2.2;

type Source = {
  specification: string;
  settings: { width: number; length: number; height: number; thickness: number } | null;
};

/**
 * Takes the dieline image from the drawing itself: cut, crease and glue in
 * die-maker colours at the template's saved size, without bleed or rulers,
 * centred on the same light grey as the model image. Handed back as a file, so
 * the form uploads it like a picked one.
 */
export default function DielineCapture({ dieline, onCapture }: { dieline: Source; onCapture: (file: File) => void }) {
  const [busy, setBusy] = useState(false);

  const capture = async () => {
    setBusy(true);
    try {
      const file = await drawDieline(dieline);
      if (file) onCapture(file);
      else toast.error("This dieline has no drawing to capture yet. Save it in the editor first.");
    } catch {
      toast.error("The dieline could not be captured.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" disabled={busy || !dieline.settings} onClick={capture} className="w-full">
      <PenTool />
      {busy ? "Capturing…" : "Capture 2D"}
    </Button>
  );
}

async function drawDieline({ specification, settings }: Source): Promise<File | null> {
  if (!settings) return null;
  const parsed = parseDocument(JSON.parse(specification));
  if (!parsed.ok) return null;
  const s = settings;
  // Bleed 0: the image shows the die, not the print area around it.
  const result = render(parsed.document, { width: s.width, length: s.length, height: s.height, thickness: s.thickness, bleed: 0 });
  if (!result.paths.length) return null;

  // The exported drawing's own extent, so the image is never stretched.
  const extent = (svg: string) => {
    const [, , vw, vh] = (svg.match(/viewBox="([^"]+)"/)?.[1] ?? "").split(" ").map(Number);
    return { w: vw ?? 0, h: vh ?? 0 };
  };
  const options = { includeBleed: false, includeRulers: false, padding: 0 } as const;
  const { w, h } = extent(toSVG(result, options));
  if (!(w > 0 && h > 0)) return null;
  const pxPerMm = (SIZE * FILL) / Math.max(w, h);
  const svg = toSVG(result, { ...options, strokeWidth: STROKE_PX / pxPerMm })
    // Sized in pixels, so the browser rasterizes it sharp at the size it is drawn.
    .replace(/width="[^"]*mm" height="[^"]*mm"/, `width="${w * pxPerMm}" height="${h * pxPerMm}"`);

  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const out = document.createElement("canvas");
    out.width = SIZE;
    out.height = SIZE;
    const ctx = out.getContext("2d")!;
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.drawImage(img, (SIZE - w * pxPerMm) / 2, (SIZE - h * pxPerMm) / 2, w * pxPerMm, h * pxPerMm);
    // WebP keeps it well under the server action's body limit.
    const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/webp", 0.92));
    return blob ? new File([blob], "dieline.webp", { type: "image/webp" }) : null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
