import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import { IModel, IPoint } from "makerjs";
import Pacsaz from "../../Pacsaz";
import { glueMapper } from "../glueMapper";

export function addGlue(
  trimModel: IModel,
  {
    customPoints,
    height,
    width,
    length,
  }: {
    width: number;
    height: number;
    length?: number;
    customPoints?: {
      from: IPoint;
      to: IPoint;
    };
  },
) {
  const pb = new Pacsaz.point.Builder(customPoints?.from ?? undefined);
  const size = glueMapper(width, height);
  const glueMargin = 8;
  const { safeFoldOffset } = getDielineSettings();

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

  const glue = new Pacsaz.shapes.LineChain(pts);

  Pacsaz.shape.push(trimModel, "glue", glue);
  return { model: glue, size };
}
