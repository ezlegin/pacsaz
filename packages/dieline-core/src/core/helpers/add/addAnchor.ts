import M from "makerjs";
import { onProduction } from "@repo/lib/data/consts";
import Pacsaz from "../../pacsaz";

export function addAnchor(
  model: M.IModel,
  from: M.IModel,
  show: boolean = false,
) {
  if (!show || onProduction) return;

  const trimChain = M.model.findSingleChain(from);
  const keyPoints = M.chain.toKeyPoints(trimChain);
  const holes = new M.models.Holes(0.7, keyPoints);
  Pacsaz.model.push(model, "anchor", holes, "anchor");
}
