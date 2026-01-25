import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";

type OffsetKey = "width" | "length" | "height";
export type OffsetValue = { inner: number; outer: number };

export type Offset = Record<OffsetKey, OffsetValue>;

export function resolveOffsets(): Offset {
  const { material, customThickness } = getDielineSettings();
  if (!material) throw new Error("Settings Not Provided. [offsetResolver]");

  const inner = material.offset.inner * 2;
  const outer = (customThickness ?? material.offset.outer) * 2;

  const offsets = {
    width: { inner, outer },
    length: { inner, outer },
    height: { inner, outer },
  };

  return offsets;
}
