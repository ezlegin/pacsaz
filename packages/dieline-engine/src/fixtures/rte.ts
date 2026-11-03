import { presetBody } from "../library/presets";
import type { DielineDocument } from "../spec/types";

/**
 * Reverse tuck end built from one box-body node: the same carton as the
 * hand-drawn `tuckEndBox`, in a fraction of the specification.
 */
export const rteBox: DielineDocument = {
  version: 2,
  params: [],
  variables: [],
  nodes: [{ ...presetBody("reverseTuckEnd", "body"), id: "body" }],
  rulers: [
    {
      id: "rulerFront",
      name: "rulerFront",
      from: { x: "@body.front.topLeft.x", y: "@body.front.topLeft.y" },
      to: { x: "@body.front.topRight.x", y: "@body.front.topRight.y" },
      offset: "8",
    },
  ],
  components: [],
};
