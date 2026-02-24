import M, { IModel } from "makerjs";
import Pacsaz from "../Pacsaz";

export class Bleed implements IModel {
  constructor(trimModel: IModel, bleedAmount: number) {
    if (!trimModel.models) {
      console.error("Trim Model not Available.");
      return;
    }

    const cloned = M.model.clone(trimModel);
    const glueModel = cloned.models?.glue;
    if (glueModel) {
      const chain = M.model.findSingleChain(glueModel);
      if (!chain) return;
      const keyPoints = M.chain.toKeyPoints(chain!);
      const points = {
        start: keyPoints.at(0)!,
        end: keyPoints.at(-1)!,
      };

      const path = new Pacsaz.shapes.Lines([points.start, points.end]);
      Pacsaz.shape.push(cloned, "glue-path", path);
      delete cloned.models?.glue;
    }

    const chain = M.model.findChains(cloned) as M.IChain[];
    if (!chain) return;

    const newerModel: IModel = { paths: {} };
    let idx = 0;
    for (const c of chain) {
      const newModel = M.chain.toNewModel(c);

      for (const key in newModel.paths) {
        const path = newModel.paths[key]!;
        newerModel.paths![`path-${idx}`] = path;
        idx++;
      }
    }

    const bleed = M.model.outline(newerModel, bleedAmount, 1);
    Pacsaz.shape.push(this, "bleed", bleed, "bleed");
  }
}
