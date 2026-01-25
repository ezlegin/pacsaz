import { getDielineCTX } from "@repo/store/dieline/context.store";
import {
  DimensionKey,
  getDimension,
} from "@repo/store/dieline/dimension.store";
import { getOffset } from "@repo/store/dieline/offset.store";
import { IModel, IPoint } from "makerjs";
import { addGuideLine } from "../add/addGuideline";
import { addModelToLayer } from "../add/addModelToLayer";

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
  const offsets = getOffset();
  const { raw } = getDimension();
  const { dimensionType } = getDielineCTX();
  if (!offsets) throw new Error("Offsets Are not provided. [drawGuideline]");

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
