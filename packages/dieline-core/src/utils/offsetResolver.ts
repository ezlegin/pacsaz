import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";

type OffsetKey = "width" | "length" | "height";
export type OffsetValue = { inner: number; outer: number };

export type Offset = Record<OffsetKey, OffsetValue>;

export function resolveOffsets(): Offset {
  const { material, thickness } = getDielineSettings();

  const inner = material.offset.inner * 2;
  const outer =
    (thickness !== material.thickness ? thickness : material.offset.outer) * 2;

  const offsets = {
    width: { inner, outer },
    length: { inner, outer },
    height: { inner, outer },
  };

  return offsets;
}
