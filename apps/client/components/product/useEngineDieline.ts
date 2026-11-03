"use client";

import { loadCustomization, loadTemplate, manufactureSize, previewSvg, toFoldSVG, type DimensionType } from "@/lib/dieline/engine";
import { materials } from "@repo/dieline-core/data/materials";
import { applyCustomization, render } from "@repo/dieline-engine";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { setDefaultSettings } from "@repo/store/slices/dielineSettingsSlice";
import { setFoldSvg, setSvg } from "@repo/store/slices/svgSlice";
import { useEffect, useMemo, useTransition } from "react";

type Settings = {
  bleed: number;
  width: number;
  length: number;
  height: number;
  thickness: number;
  material: string;
  dimensionType: string;
  foldConfig?: string | null;
  customization?: string | null;
};

export type EngineDieline = {
  specification: string;
  materials: string;
  defaultMaterial: string;
  dimensionTypes: string;
  minWidth: number;
  minLength: number;
  minHeight: number;
  maxWidth: number;
  maxLength: number;
  maxHeight: number;
  settings: Settings;
  /** A saved copy's settings, which win over the template's. */
  customSettings?: Settings | null;
};

/** Shown in place of the drawing when a template was made with the old editor. */
const OUTDATED_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">` +
  `<text x="200" y="64" text-anchor="middle" font-size="14" fill="#64748b" font-family="sans-serif">` +
  `این قالب در حال به‌روزرسانی است</text></svg>`;

/**
 * Renders a template with `@repo/dieline-engine` from the size settings in the
 * Redux store, and puts the drawing and the 3D fold SVG back in the store for
 * the preview, the 3D view and the loading overlay. It replaces the legacy
 * `useDielineGenerator`; downloads are rendered again on the server.
 */
export function useEngineDieline(dieline: EngineDieline, options: { watermark: boolean }) {
  const dispatch = useAppDispatch();
  const [isRendering, startTransition] = useTransition();
  const settings = useAppSelector((s) => s.dielineSettings);
  const template = useMemo(() => loadTemplate(dieline.specification), [dieline.specification]);
  const customization = useMemo(() => loadCustomization(dieline.customSettings?.customization), [dieline.customSettings?.customization]);

  // Defaults from the template, or from the saved copy being reopened.
  useEffect(() => {
    const s = dieline.customSettings ?? dieline.settings;
    const raw = { width: s.width, length: s.length, height: s.height };
    const material = materials.find((m) => m.value === (dieline.customSettings?.material ?? dieline.defaultMaterial)) ?? materials[0]!;
    const type = s.dimensionType as DimensionType;

    dispatch(
      setDefaultSettings({
        bleed: s.bleed,
        dimension: { raw, resolved: manufactureSize(raw, type, material.value, s.thickness) },
        dimensionTypes: dieline.dimensionTypes.split(",") as DimensionType[],
        minDimension: { width: dieline.minWidth, height: dieline.minHeight, length: dieline.minLength },
        maxDimension: { width: dieline.maxWidth, height: dieline.maxHeight, length: dieline.maxLength },
        material,
        materials: dieline.materials
          .split(",")
          .map((v) => materials.find((m) => m.value === v))
          .filter((m) => m !== undefined),
        thickness: s.thickness,
        dimensionType: type,
        format: "pdf",
        showOverallRulers: false,
        // Fold directions are authored in the Studio and saved with the template.
        foldConfig: template?.folds ? JSON.stringify({ version: 1, ...template.folds }) : "",
      }),
    );
    // Defaults are set once per page; later changes come from the settings panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { dimension, dimensionType, material, thickness, bleed, showOverallRulers } = settings;
  useEffect(() => {
    // Until the defaults land the store holds zero sizes.
    if (!dimension.raw.width && !dimension.raw.length) return;
    if (!template) {
      dispatch(setSvg(OUTDATED_SVG));
      dispatch(setFoldSvg(null));
      return;
    }
    startTransition(() => {
      const size = manufactureSize(dimension.raw, dimensionType, material.value, thickness);
      const { document, params } = applyCustomization(template, customization);
      const result = render(document, { ...size, thickness, bleed, params });
      dispatch(setSvg(previewSvg(result, { watermark: options.watermark, rulers: showOverallRulers })));
      dispatch(setFoldSvg(toFoldSVG(result)));
    });
  }, [dispatch, template, customization, dimension.raw, dimensionType, material.value, thickness, bleed, showOverallRulers, options.watermark]);

  return { isRendering, template };
}
