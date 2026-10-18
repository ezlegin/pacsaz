"use client";

import {
  clampArtworkCentre,
  clampArtworkScale,
  defaultArtworkTransform,
  MAX_ARTWORK_SCALE,
  MIN_ARTWORK_SCALE,
  type ArtworkTransform,
} from "./artwork";
import { extractTrimPaths, svgBounds } from "./extract";
import { Button } from "@repo/ui/components/button";
import { Move, RotateCcw, ZoomIn } from "lucide-react";
import { useMemo, useRef } from "react";

/**
 * Places an image on the flat dieline, live.
 *
 * The image sits *under* the sheet: everything outside the trim outline is dimmed,
 * so the result reads as artwork printed on board. Dragging moves the image and
 * reports every change immediately, so the 3D view beside it updates as you drag
 * rather than on a confirm step.
 *
 * The transform is expressed in normalized pattern space — the same space the UVs
 * use — which is what makes a drag here land exactly where it appears on the model.
 */
export const ArtworkPlacer = ({
  svg,
  imageUrl,
  value,
  onChange,
  labels,
}: {
  svg: string;
  imageUrl: string;
  value: ArtworkTransform;
  onChange: (transform: ArtworkTransform) => void;
  /** Copy is injected because the client app is Persian and admin is English. */
  labels: {
    dragHint: string;
    sizeLabel: string;
    reset: string;
    noGeometry: string;
  };
}) => {
  const surface = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const bounds = useMemo(() => svgBounds(svg), [svg]);
  const trimPaths = useMemo(() => extractTrimPaths(svg), [svg]);

  if (!bounds) {
    return (
      <p className="py-8 text-center text-[11px] text-muted-foreground">
        {labels.noGeometry}
      </p>
    );
  }

  const move = (dx: number, dy: number) => {
    const rect = surface.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    onChange({
      ...value,
      cx: clampArtworkCentre(value.cx + dx / rect.width),
      cy: clampArtworkCentre(value.cy + dy / rect.height),
    });
  };

  const strokeWidth = Math.max(bounds.width, bounds.height) * 0.0035;

  return (
    <div className="space-y-3">
      {/* ------------------------------- canvas -------------------------------- */}
      <div
        ref={surface}
        onPointerDown={(event) => {
          drag.current = { x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;

          move(
            event.clientX - drag.current.x,
            event.clientY - drag.current.y,
          );
          drag.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={(event) => {
          drag.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        style={{ aspectRatio: `${bounds.width} / ${bounds.height}` }}
        className="relative w-full cursor-grab touch-none select-none overflow-hidden rounded-lg border bg-white active:cursor-grabbing"
      >
        {/* The image, positioned in normalized pattern units. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          draggable={false}
          className="pointer-events-none absolute max-w-none"
          style={{
            width: `${value.scale * 100}%`,
            left: `${value.cx * 100}%`,
            top: `${value.cy * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Everything outside the sheet dimmed, so only board shows the image. */}
        <svg
          className="pointer-events-none absolute inset-0 size-full"
          viewBox={`${bounds.min[0]} ${bounds.min[1]} ${bounds.width} ${bounds.height}`}
          preserveAspectRatio="none"
        >
          <defs>
            <mask id="artwork-outside-sheet">
              <rect
                x={bounds.min[0]}
                y={bounds.min[1]}
                width={bounds.width}
                height={bounds.height}
                fill="white"
              />
              {trimPaths.map((d, index) => (
                <path key={index} d={d} fill="black" fillRule="evenodd" />
              ))}
            </mask>
          </defs>

          <rect
            x={bounds.min[0]}
            y={bounds.min[1]}
            width={bounds.width}
            height={bounds.height}
            fill="white"
            opacity={0.74}
            mask="url(#artwork-outside-sheet)"
          />

          {trimPaths.map((d, index) => (
            <path
              key={index}
              d={d}
              fill="none"
              stroke="#2563eb"
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
          ))}
        </svg>

        {/* Drag affordance. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/45 to-transparent px-2 pb-1.5 pt-5">
          <Move className="size-3 text-white/90" />
          <span className="text-[9px] font-medium text-white/90">
            {labels.dragHint}
          </span>
        </div>
      </div>

      {/* -------------------------------- zoom --------------------------------- */}
      <div className="flex items-center gap-2">
        <ZoomIn className="size-3.5 shrink-0 text-muted-foreground" />

        <input
          type="range"
          min={MIN_ARTWORK_SCALE * 100}
          max={MAX_ARTWORK_SCALE * 100}
          value={Math.round(value.scale * 100)}
          onChange={(event) =>
            onChange({
              ...value,
              scale: clampArtworkScale(Number(event.target.value) / 100),
            })
          }
          aria-label={labels.sizeLabel}
          className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-[var(--primary)]"
        />

        <span className="w-9 shrink-0 text-center text-[10px] font-bold tabular-nums">
          {Math.round(value.scale * 100)}٪
        </span>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => onChange(defaultArtworkTransform())}
      >
        <RotateCcw className="size-3.5" />
        {labels.reset}
      </Button>
    </div>
  );
};

export default ArtworkPlacer;
