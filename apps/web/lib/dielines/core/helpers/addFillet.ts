import M, { IModel } from "makerjs";
import { addModelToLayer } from "./addModelToLayer";

export function addFillet(model: IModel, radius: number = 0) {
  const chain = M.model.findSingleChain(model);
  if (!chain || radius <= 0) return;

  let fillet: IModel | null = null;

  for (let r = radius; r > 0; r--) {
    fillet = M.chain.fillet(chain, r);
    if (fillet) break;
  }

  if (fillet) {
    addModelToLayer(model, "fillet", fillet, "trim");
  }
}
