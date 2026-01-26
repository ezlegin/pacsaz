import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import { setOverallSize } from "@repo/store/dieline/overallSize.store";
import { getDevCTX } from "@repo/store/dieline/useDeveloperToolsStore";
import M, { IModel } from "makerjs";
import { onDevelepe } from "../../data/consts";
import { addAnchor } from "./add/addAnchor";
import { addBleed } from "./add/addBleed";
import { addContainer } from "./add/addContainer";
import { addOverallDimensionGuides } from "./add/addOverallDimensionGuides";
import { Watermark } from "./injectWatermark";
import { svgExporter, svgSettings } from "./svgExporter";

type ModelExporter = {
  model: IModel;
  trimModel: IModel;
  watermark: Watermark;
};

export function modelBuilder({ model, trimModel, watermark }: ModelExporter) {
  const { showAnchors, showContainer, showOverallDimensions } = getDevCTX();

  const bleedAmount = getDielineSettings().bleed;
  if (!bleedAmount) throw new Error("Bleed is not provided. [modelBuilder]");
  const bleed = addBleed({
    model,
    trimModel,
    bleedAmount,
  });

  const cotainer = addContainer({
    model,
    from: trimModel,
    margin: showContainer ? svgSettings.margins.container : 6, // 6 is the minimum amount to avoid clipping view
  });

  const bleedSize = M.measure.modelExtents(bleed);
  const containerSize = M.measure.modelExtents(cotainer);
  const trimSize = M.measure.modelExtents(trimModel);

  setOverallSize(() => ({
    overallSizes: {
      bleed: bleedSize,
      container: containerSize,
      trim: trimSize,
    },
  }));

  addAnchor(model, trimModel, showAnchors);

  addOverallDimensionGuides({
    model,
    trimModel,
    show: showOverallDimensions,
  });

  onDevelepe && console.log("Main Model:", model);
  return svgExporter({
    model,
    bleedModel: bleed,
    watermark,
  });
}
