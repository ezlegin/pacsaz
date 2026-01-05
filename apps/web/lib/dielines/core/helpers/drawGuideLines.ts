import { IModel, IPoint } from "makerjs";
import { DimensionKey, Offsets } from "../types";
import { addModelToLayer } from "./addModelToLayer";
import { DimensionType } from "./applyDimensionOffset";
import { addGuideLine } from "./addGuideline";

type Orientation = "horizontal" | "vertical";

type DrawGuideLinesParams = {
  width: number;
  length: number;
  height?: number;

  rawDim: {
    width: number;
    height: number;
    length: number;
  };

  offsets: Offsets;

  dimensionType: DimensionType;

  guides: GuideConfig[];
};

type GuideConfig = {
  type: DimensionKey;
  orientation: Orientation;
  from?: IPoint;
  to?: IPoint;
};

export function drawGuideLines(
  model: IModel,
  {
    width,
    length,
    height = 0,
    rawDim,
    offsets,
    dimensionType,
    guides,
  }: DrawGuideLinesParams
) {
  const guidesModel: IModel = { models: {} };
  addModelToLayer(model, "guides", guidesModel);

  const defaults = {
    height: {
      type: "height",
      from: [width, length / 2],
      to: [width + (height ?? 0), length / 2],
    },
    width: {
      type: "width",
      from: [0, length / 4],
      to: [width, length / 4],
    },
    length: {
      type: "length",
      from: [width + height + width / 4, 0],
      to: [width + height + width / 4, length],
    },
  };

  for (const guide of guides) {
    addGuideLine(guidesModel, {
      dimType: "partly",
      type: guide.type,
      from: guide.from ?? defaults[guide.type].from,
      to: guide.to ?? defaults[guide.type].to,
      value: rawDim[guide.type],
      orientation: guide.orientation,
      dimensionType,
      dimensionTypeOffset: {
        widthOffset: offsets.width,
        lengthOffset: offsets.length,
      },
    });
  }
}
