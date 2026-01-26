import type { IModel } from "makerjs";
import { getMeasurementOfModel } from "../getWidthAndHeightOfModel";
import { addGuideLine } from "./addGuideline";
import { svgSettings } from "../svgExporter";

interface AddOverallDimensionGuidesOptions {
  model: IModel;
  trimModel: IModel;
  margin?: number;
  show: boolean;
}

export function addOverallDimensionGuides({
  model,
  trimModel,
  margin = svgSettings.margins.dimensionGuide,
  show,
}: AddOverallDimensionGuidesOptions) {
  if (!show) return;

  const { bl, br, tl, width, height } = getMeasurementOfModel(trimModel);

  // Height (vertical)
  addGuideLine(model, {
    dimType: "overall",
    dimensionType: "manufacture",
    dimensionTypeOffset: {
      lengthOffset: { inner: 0, outer: 0 },
      widthOffset: { inner: 0, outer: 0 },
      heightOffset: { inner: 0, outer: 0 },
    },
    from: [bl[0]! - margin, bl[1]!],
    to: [tl[0]! - margin, tl[1]!],
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
      heightOffset: { inner: 0, outer: 0 },
    },
    from: [bl[0]!, bl[1]! - margin],
    to: [br[0]!, br[1]! - margin],
    orientation: "horizontal",
    type: "width",
    value: width,
  });
}
