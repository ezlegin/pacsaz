import { mmToPt } from "@/utils/sizeConvertor";
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
    mmToPt(marginMM),
    1
  );

  const containerSize = M.measure.modelExtents(container);

  model.models ??= {};
  model.models[id] = container;
  model.models[id].layer = layer;

  return {
    size: {
      width: containerSize.width,
      height: containerSize.height,
    },
  };
}
