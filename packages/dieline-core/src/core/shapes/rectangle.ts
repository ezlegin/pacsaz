import { Side } from "@/data/core.types";
import M, { IModel } from "makerjs";

interface Options {
  deleteSide?: Side;
  radius?: number;
}

export class Rectangle implements IModel {
  paths?: M.IPathMap | undefined;

  constructor(width: number, height: number, options?: Options) {
    const rect = new M.models.RoundRectangle(
      width,
      height,
      options?.radius ?? 0,
    );

    if (options) {
      const { deleteSide } = options;
      if (deleteSide) delete rect.paths?.[deleteSide];
    }

    this.paths = rect.paths;
  }
}

//todo: When having radius and delete a side, issues come to picture. sovle it.
// add origin (if needed in future)
