import { toPt } from "@/utils/sizeConvertor";
import M from "makerjs";

interface AddContainerOptions {
  model: M.IModel;
  from: M.IModel;
  marginMM: number;
  id?: string;
  layer?: string;
}

export function addContainer({
  model,
  from,
  marginMM,
  id = "container",
  layer = "container",
}: AddContainerOptions) {
  const { width, height } = M.measure.modelExtents(from);

  const container = M.model.outline(
    new M.models.Rectangle(width, height),
    toPt(marginMM),
    1
  );

  model.models ??= {};
  model.models[id] = container;
  model.models[id].layer = layer;

  return container;
}
