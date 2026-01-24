import { getDielineCTX } from "@repo/store/dieline/context.store";
import { toPt } from "./sizeConvertor";

export function resolveOffsets() {
  const { material, customThickness } = getDielineCTX();

  const inner = toPt(material.offset.inner) * 2;
  const outer = toPt(customThickness ?? material.offset.outer) * 2;

  const offsets = {
    width: { inner, outer },
    length: { inner, outer },
    height: { inner, outer },
  };

  return offsets;
}
