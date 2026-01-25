import { getDielineCTX } from "@repo/store/dieline/context.store";

export function resolveOffsets() {
  const { material, customThickness } = getDielineCTX();

  const inner = material.offset.inner * 2;
  const outer = (customThickness ?? material.offset.outer) * 2;

  const offsets = {
    width: { inner, outer },
    length: { inner, outer },
    height: { inner, outer },
  };

  return offsets;
}
