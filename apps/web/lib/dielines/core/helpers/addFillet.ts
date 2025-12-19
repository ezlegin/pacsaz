import M, { IModel } from "makerjs";
import { addModelToLayer } from "./addModelToLayer";

export function addFillet(model: IModel, radius: number = 0) {
  const chain = M.model.findSingleChain(model);
  const fillet = M.chain.fillet(chain, radius);
  if (fillet) addModelToLayer(model, "fillet", fillet, "trim");
}
