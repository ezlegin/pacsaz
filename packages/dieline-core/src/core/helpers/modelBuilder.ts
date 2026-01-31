import { getDevCTX } from "@repo/store/dieline/useDeveloperToolsStore";
import { IModel } from "makerjs";
import { addOverallDimensionGuides } from "./add/addOverallDimensionGuides";
import { Watermark } from "./injectWatermark";
import { svgExporter } from "./svgExporter";

type ModelExporter = {
  model: IModel;
  trimModel: IModel;
  watermark: Watermark;
};

export function modelBuilder({ model, trimModel, watermark }: ModelExporter) {
  const { showOverallDimensions } = getDevCTX();

  addOverallDimensionGuides({
    model,
    trimModel,
    show: showOverallDimensions,
  });

  return svgExporter({
    model,
    bleedModel: {},
    watermark,
  });
}
