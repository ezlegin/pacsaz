"use client";

import type { BoxSize, Drawing } from "@/lib/dieline/homeBox";
import type { DielineDocument, DimensionType } from "@repo/dieline-engine";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition } from "react";

export type BoxMaterial = { value: string; label: string; thickness: number };
export type BoxRange = Record<keyof BoxSize, { min: number; max: number }>;

export type HomeBoxInitial = {
  doc: DielineDocument;
  slug: string;
  title: string;
  dimensionType: DimensionType;
  bleed: number;
  foldConfig: string | null;
  size: BoxSize;
  range: BoxRange;
  materials: BoxMaterial[];
  drawing: Drawing;
  foldSvg: string;
  /** Fits the largest box the sliders reach, so the drawing grows on a fixed scale. */
  viewBox: string;
};

type HomeBox = HomeBoxInitial & {
  material: BoxMaterial;
  /** The fold SVG, settled: the 3D model rebuilds after a drag, not during it. */
  settledFoldSvg: string;
  edited: boolean;
  /** Where the visitor's own box opens in the real editor. */
  href: string;
  setDimension: (key: keyof BoxSize, value: number) => void;
  setMaterial: (material: BoxMaterial) => void;
  /** Starts fetching the engine before the first edit needs it. */
  warmUp: () => void;
};

const Context = createContext<HomeBox | null>(null);

export const useHomeBox = () => {
  const box = useContext(Context);
  if (!box) throw new Error("useHomeBox outside HomeBoxProvider");
  return box;
};

const loadEngine = () => import("@/lib/dieline/homeBox");

/**
 * The visitor's box, shared by the hero and the fold story.
 *
 * The first drawing comes from the server, so the page shows the product before
 * any script runs. The engine is a large module, so it is only fetched once a
 * visitor reaches for the controls.
 */
export const HomeBoxProvider = ({ initial, children }: { initial: HomeBoxInitial; children: React.ReactNode }) => {
  const [size, setSize] = useState(initial.size);
  const [material, setMaterial] = useState(initial.materials[0]!);
  const [drawing, setDrawing] = useState(initial.drawing);
  const [foldSvg, setFoldSvg] = useState(initial.foldSvg);
  const [settledFoldSvg, setSettledFoldSvg] = useState(initial.foldSvg);
  const [edited, setEdited] = useState(false);
  const [, startTransition] = useTransition();
  const firstRun = useRef(true);

  const setDimension = useCallback((key: keyof BoxSize, value: number) => {
    setEdited(true);
    setSize((current) => ({ ...current, [key]: value }));
  }, []);

  const chooseMaterial = useCallback((next: BoxMaterial) => {
    setEdited(true);
    setMaterial(next);
  }, []);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    let stale = false;
    const inputs = { size, dimensionType: initial.dimensionType, thickness: material.thickness, bleed: initial.bleed };

    void loadEngine().then(({ buildDrawing, buildFoldSvg }) => {
      if (stale) return;
      startTransition(() => {
        setDrawing(buildDrawing(initial.doc, inputs));
        setFoldSvg(buildFoldSvg(initial.doc, inputs));
      });
    });

    return () => {
      stale = true;
    };
  }, [size, material, initial]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSettledFoldSvg(foldSvg), 350);
    return () => window.clearTimeout(timer);
  }, [foldSvg]);

  const value = useMemo<HomeBox>(() => {
    const query = new URLSearchParams({ w: String(size.width), l: String(size.length), h: String(size.height), m: material.value });
    return {
      ...initial,
      size,
      material,
      drawing,
      foldSvg,
      settledFoldSvg,
      edited,
      href: `/dieline/${initial.slug}?${query}`,
      setDimension,
      setMaterial: chooseMaterial,
      warmUp: () => void loadEngine(),
    };
  }, [initial, size, material, drawing, foldSvg, settledFoldSvg, edited, setDimension, chooseMaterial]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};
