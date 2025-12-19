import M from "makerjs";
import { addModelToLayer } from "./addModelToLayer";

export function addAnchor(model: M.IModel, from: M.IModel) {
  const trimChain = M.model.findSingleChain(from);
  const keyPoints = M.chain.toKeyPoints(trimChain);
  const holes = new M.models.Holes(1.4, keyPoints);
  addModelToLayer(model, "anchor", holes, "anchor");
}
