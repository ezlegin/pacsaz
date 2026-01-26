import M from "makerjs";
import { addModelToLayer } from "./addModelToLayer";
import { onProduction } from "../../../data/consts";

export function addAnchor(
  model: M.IModel,
  from: M.IModel,
  show: boolean = false
) {
  if (!show || onProduction) return;

  const trimChain = M.model.findSingleChain(from);
  const keyPoints = M.chain.toKeyPoints(trimChain);
  const holes = new M.models.Holes(0.7, keyPoints);
  addModelToLayer(model, "anchor", holes, "anchor");
}
