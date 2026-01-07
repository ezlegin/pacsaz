import { IModel, IPoint } from "makerjs";
import { PointBuilder } from "./pointBuilder";
import { addLine } from "./addLine";
import { glueMapper } from "./glueMapper";
import M from "makerjs";

export function addGlue(
  trimModel: IModel,
  {
    customPoints,
    heightMM,
    widthMM,
    lengthMM,
    safeFoldOffset,
  }: {
    widthMM: number;
    heightMM: number;
    lengthMM?: number;
    customPoints?: {
      from: IPoint;
      to: IPoint;
    };
    safeFoldOffset: number;
  }
) {
  const pb = new PointBuilder(customPoints?.from ?? undefined);
  const size = glueMapper(widthMM, heightMM);
  const glueMargin = 8;

  const pts = lengthMM
    ? pb
        .draw(-size, glueMargin)
        .up(lengthMM - glueMargin * 2)
        .draw(size, glueMargin)
        .up(safeFoldOffset)
        .build()
    : pb
        .draw(-size, glueMargin)
        .up(customPoints?.to[1]! - glueMargin * 2)
        .draw(size, glueMargin)
        .up(safeFoldOffset)
        .build();

  const glue = addLine(pts, false);

  M.model.addModel(trimModel, glue, "glue");
  return { model: glue, size };
}
