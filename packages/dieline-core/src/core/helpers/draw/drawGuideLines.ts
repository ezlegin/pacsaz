import { IModel, IPoint } from "makerjs";
import { addGuideLine } from "../add/addGuideline";
import { addModelToLayer } from "../add/addModelToLayer";
import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import { resolveOffsets } from "../../../utils/offsetResolver";
import { DimensionKey } from "@repo/store/data/types";

type Orientation = "horizontal" | "vertical";

type DrawGuideLinesParams = {
  width: number;
  length: number;
  height?: number;
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
  { width, length, height, guides }: DrawGuideLinesParams
) {
  const {
    dimension: { raw },
  } = getDielineSettings();

  const offsets = resolveOffsets();

  const { dimensionType } = getDielineSettings();
  if (!dimensionType)
    throw new Error("Settings Not Provided. [drawGuidelines]");

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
      from: [height ? width * 2 + height + height / 2 : width / 4, 0],
      to: [height ? width * 2 + height + height / 2 : width / 4, length],
    },
  };

  for (const guide of guides) {
    addGuideLine(guidesModel, {
      dimType: "partly",
      type: guide.type,
      from: guide.from ?? defaults[guide.type].from,
      to: guide.to ?? defaults[guide.type].to,
      orientation: guide.orientation,
      dimensionType,
      dimensionTypeOffset: {
        widthOffset: offsets.width,
        lengthOffset: offsets.length,
      },
      value: raw[guide.type],
    });
  }
}
