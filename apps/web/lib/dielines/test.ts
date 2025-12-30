import M from "makerjs";
import { BLEED, MATERIALS } from "./core/consts";
import { initiateModel } from "./core/helpers/initiateModels";
import { modelBuilder } from "./core/helpers/modelBuilder";
import { DielineGeneratorProps } from "./core/types";
import { addFoldLine } from "./core/helpers/addFoldLine";
import { addHoleArc } from "./core/helpers/addHoleArc";

const postalCard: DielineGeneratorProps = {
  slug: "postal-card",
  title: "Test", //todo: sync to database, not here.
  dimensions: {
    defaultDimensions: {
      length: 160,
      width: 90,
      height: 0,
    },
    minDimensions: {
      length: 30,
      width: 30,
      height: 0,
    },
  },
  dimensionsType: ["manufacture", "inner", "outer"],
  materials: {
    default: MATERIALS["glossy-cardboard"],
    included: [
      MATERIALS["glossy-cardboard"],
      MATERIALS["f-flute"],
      MATERIALS["art-paper"],
    ],
  },
  model({
    dimensions: { resolved, bleedSize, customThickness },
    developers: { showAnchors, showOverallDimensions, showWatermark },
    selectedMaterial,
  }) {
    const {
      bleedAmount,
      model,
      offsets,
      trimModel,
      foldModel,
      safeFoldOffset,
    } = initiateModel({
      defaultBleed: BLEED.default,
      resolved,
      selectedMaterial,
      bleedSize,
      customThickness,
    });

    //! TRIM
    const poly = new M.models.ConnectTheDots(false, [
      [0, 0],
      [0, 100],
      [100, 100],
      [100, 0],
      [120, 0],
    ]);
    M.model.addModel(trimModel, poly, "myTrim");

    const { hole } = addHoleArc({ startPoint: [120, 0], safeFoldOffset });

    M.path.addTo(hole, trimModel, "hole");

    addFoldLine(foldModel, { id: "hi", from: [0, 0], to: [120, -50] });

    return modelBuilder({
      model,
      trimModel: trimModel,
      bleedAmount,
      showAnchors,
      offsets,
      material: selectedMaterial,
      showOverallDimensions,
      watermark: {
        show: showWatermark,
        offset: {
          x: 0,
          y: 0,
        },
      },
    });
  },
};

export default postalCard;
