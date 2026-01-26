import { IModel, IPoint } from "makerjs";
import { PointBuilder } from "../pointBuilder";
import { addLine } from "./addLine";
import { glueMapper } from "../glueMapper";
import M from "makerjs";

export function addGlue(
  trimModel: IModel,
  {
    customPoints,
    height,
    width,
    length,
    safeFoldOffset,
  }: {
    width: number;
    height: number;
    length?: number;
    customPoints?: {
      from: IPoint;
      to: IPoint;
    };
    safeFoldOffset: number;
  }
) {
  const pb = new PointBuilder(customPoints?.from ?? undefined);
  const size = glueMapper(width, height);
  const glueMargin = 8;

  const pts = length
    ? pb
        .draw(-size, glueMargin)
        .up(length - glueMargin * 2)
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
