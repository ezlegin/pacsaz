import M from "makerjs";

export function cloneMirrorMove(
  model: M.IModel,
  mirrorX: boolean,
  mirrorY: boolean,
  moveTo: M.IPoint
) {
  return M.model.moveRelative(
    M.model.zero(M.model.mirror(M.model.clone(model), mirrorX, mirrorY)),
    moveTo
  );
}

export function cloneRotateMove(
  model: M.IModel,
  rotate: number,
  moveTo: M.IPoint
) {
  return M.model.moveRelative(
    M.model.zero(M.model.rotate(M.model.clone(model), rotate)),
    moveTo
  );
}
