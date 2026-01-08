import { toPt } from "../utils/sizeConvertor";
import type { IModel } from "makerjs";
import { MARGINS } from "../consts";
import { getMeasurementOfModel } from "./getWidthAndHeightOfModel";
import { addGuideLine } from "./addGuideline";

interface AddOverallDimensionGuidesOptions {
  model: IModel;
  trimModel: IModel;
  margin?: number;
  show: boolean;
}

export function addOverallDimensionGuides({
  model,
  trimModel,
  margin = MARGINS.dimensionGuide,
  show,
}: AddOverallDimensionGuidesOptions) {
  if (!show) return;

  const { bl, br, tl, width, height } = getMeasurementOfModel(trimModel);

  const offset = toPt(margin);

  // Height (vertical)
  addGuideLine(model, {
    dimType: "overall",
    dimensionType: "manufacture",
    dimensionTypeOffset: {
      lengthOffset: { inner: 0, outer: 0 },
      widthOffset: { inner: 0, outer: 0 },
    },
    from: [bl[0]! - offset, bl[1]!],
    to: [tl[0]! - offset, tl[1]!],
    orientation: "vertical",
    type: "height",
    value: height,
  });

  // Width (horizontal)
  addGuideLine(model, {
    dimType: "overall",
    dimensionType: "manufacture",
    dimensionTypeOffset: {
      lengthOffset: { inner: 0, outer: 0 },
      widthOffset: { inner: 0, outer: 0 },
    },
    from: [bl[0]!, bl[1]! - offset],
    to: [br[0]!, br[1]! - offset],
    orientation: "horizontal",
    type: "width",
    value: width,
  });
}
