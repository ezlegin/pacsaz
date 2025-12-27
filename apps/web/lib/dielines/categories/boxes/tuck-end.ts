import { toPt } from "@/utils/sizeConvertor";
import M, { IModel } from "makerjs";
import { BLEED, DOOR, MATERIALS, zero } from "../../core/consts";
import { addDoor } from "../../core/helpers/addDoor";
import { addDust } from "../../core/helpers/addDust";
import {
  cloneMirrorMove,
  cloneRotateMove,
} from "../../core/helpers/cloneMirrorMove";
import { createDielineContext } from "../../core/helpers/contextCreator";
import { drawSingleLines } from "../../core/helpers/drawSingleLines";
import { addGlue } from "../../core/helpers/glueGenerator";
import { modelBuilder } from "../../core/helpers/modelBuilder";
import { DielineDefinition } from "../../core/types";
import { drawFoldLines } from "../../core/helpers/drawFoldLines";
import { drawGuideLines } from "../../core/helpers/drawGuideLines";

const tuckEnd: DielineDefinition = {
  slug: "tuck-end",
  title: "جعبه دو طرف درب", //todo: sync to database, not here.
  dimensions: {
    initialScale: 0.8,
    defaultDimensions: {
      length: 160,
      width: 90,
      height: 50,
    },
    minDimensions: {
      length: 50,
      width: 50,
      height: 50,
    },
  },
  dimensionsType: ["manufacture", "inner", "outer"],
  materials: {
    default: MATERIALS["glossy-cardboard"],
    included: [
      MATERIALS["glossy-cardboard"],
      MATERIALS["f-flute"],
      MATERIALS["e-flute"],
      MATERIALS["b-flute"],
    ],
  },
  model({
    developers: { showAnchors, showWatermark, showOverallDimensions },
    dimensions: { raw: rawDim, resolved, bleedSize },
    dimensionType,
    selectedMaterial,
  }) {
    const mateial = MATERIALS[selectedMaterial];
    const model: IModel = { models: {} };
    const bleedAmount = bleedSize ? toPt(bleedSize) : toPt(BLEED.md);

    const { height, heightMM, length, offsets, lengthMM, width, widthMM } =
      createDielineContext(resolved);

    const { dieline, foldModel, trimModel } = initiateModels();

    //! -------------- TRIM --------------

    // GLUE ----------------------------
    const glueMargin = 10;
    const { model: glue, size: glueSize } = addGlue({
      heightMM,
      widthMM,
      normal: { lengthMM, margin: glueMargin },
      safeFoldOffset: mateial.safeFoldOffset,
    });

    M.model.addModel(trimModel, glue, "glue");

    // DOOR ----------------------------
    const { tuckFlap } = DOOR;

    const { model: topDoor, doorSize } = addDoor({
      widthMM,
      heightMM,
      lengthMM,
      width,
      length,
      tuckFlap,
      materialThickkness: mateial.thickness,
      safeFoldOffset: mateial.safeFoldOffset,
    });

    M.model.addModel(trimModel, topDoor.models?.trim!, "topDoor");
    if (topDoor.paths) {
      for (const path of Object.values(topDoor.paths)) {
        M.path.addTo(path, foldModel, "fold");
      }
    }

    const clonedBottomDoor = cloneRotateMove(topDoor, 180, [
      width + height,
      -doorSize - toPt(mateial.safeFoldOffset),
    ]);

    const bottomDoor: IModel = {
      models: clonedBottomDoor.models,
      origin: clonedBottomDoor.origin,
    };

    M.model.addModel(trimModel, bottomDoor, "dustTR");
    if (clonedBottomDoor.paths) {
      for (const path of Object.values(clonedBottomDoor.paths)) {
        const model: IModel = {
          origin: clonedBottomDoor.origin,
        };
        M.path.addTo(path, model, "fold");
        M.model.addModel(foldModel, model, "fold");
      }
    }

    // DUST
    const { dustSize, model: dustTL } = addDust({
      drawAfter: topDoor,
      heightMM,
      widthMM,
      lengthMM,
      tuckFlapSize: tuckFlap.size,
      material: selectedMaterial,
    });

    M.model.addModel(trimModel, dustTL.models?.trim!, "dustTL");
    if (dustTL.paths) {
      for (const path of Object.values(dustTL.paths)) {
        M.path.addTo(path, foldModel, "fold");
      }
    }

    const { model: dustTR_RAW } = addDust({
      drawAfter: topDoor,
      heightMM,
      widthMM,
      lengthMM,
      tuckFlapSize: tuckFlap.size,
      material: selectedMaterial,
      considerDustHole: false,
    });

    const clonedDustTR = cloneMirrorMove(dustTR_RAW, true, false, [
      width * 2 + height,
      length,
    ]);

    const dustTR_TRIM: IModel = {
      models: clonedDustTR.models,
      origin: clonedDustTR.origin,
    };

    M.model.addModel(trimModel, dustTR_TRIM, "dustTR");
    if (clonedDustTR.paths) {
      for (const path of Object.values(clonedDustTR.paths)) {
        const model: IModel = {
          origin: clonedDustTR.origin,
        };
        M.path.addTo(path, model, "fold");
        M.model.addModel(foldModel, model, "fold");
      }
    }

    const { model: dustBR_RAW } = addDust({
      drawAfter: topDoor,
      heightMM,
      widthMM,
      lengthMM,
      tuckFlapSize: tuckFlap.size,
      material: selectedMaterial,
      considerOuterIndent: false,
    });

    const clonedDustBR = cloneMirrorMove(dustBR_RAW, false, true, [
      width * 2 + height,
      0 - toPt(dustSize),
    ]);

    const dustBR_TRIM: IModel = {
      models: clonedDustBR.models,
      origin: clonedDustBR.origin,
    };

    M.model.addModel(trimModel, dustBR_TRIM, "dustTR");
    if (clonedDustBR.paths) {
      for (const path of Object.values(clonedDustBR.paths)) {
        const model: IModel = {
          origin: clonedDustBR.origin,
        };
        M.path.addTo(path, model, "fold");
        M.model.addModel(foldModel, model, "fold");
      }
    }

    const { model: dustBL_RAW } = addDust({
      drawAfter: topDoor,
      heightMM,
      widthMM,
      lengthMM,
      tuckFlapSize: tuckFlap.size,
      material: selectedMaterial,
      considerOuterIndent: false,
    });

    const clonedDustBL = cloneMirrorMove(dustBL_RAW, true, true, [
      width,
      0 - toPt(dustSize),
    ]);

    const dustBL_TRIM: IModel = {
      models: clonedDustBL.models,
      origin: clonedDustBL.origin,
    };

    M.model.addModel(trimModel, dustBL_TRIM, "dustTR");
    if (clonedDustBL.paths) {
      for (const path of Object.values(clonedDustBL.paths)) {
        const model: IModel = {
          origin: clonedDustBL.origin,
        };
        M.path.addTo(path, model, "fold");
        M.model.addModel(foldModel, model, "fold");
      }
    }

    // SINGLES ----------------------------
    const singles = drawSingleLines([
      { id: "s1", pts: [zero, [width, 0]] },
      {
        id: "s2",
        pts: [
          [width + height, length],
          [width + height + width, length],
        ],
      },
      {
        id: "s3",
        pts: [
          [width * 2 + height * 2, length],
          [width * 2 + height * 2, 0],
        ],
      },
    ]);

    M.model.addModel(trimModel, singles, "singles");

    //! -------------- FOLD --------------
    drawFoldLines(foldModel, {
      verticals: [
        { from: zero, to: [0, length] },
        { from: [width, length], to: [width, 0] },
        { from: [width + height, length], to: [width + height, 0] },
        {
          from: [width * 2 + height, length],
          to: [width * 2 + height, 0],
        },
      ],
    });

    //! -------------- GUIDES --------------
    drawGuideLines(model, {
      dimensionType,
      height,
      length,
      offsets,
      rawDim,
      width,
      guides: [
        {
          type: "height",
          orientation: "horizontal",
        },
        {
          type: "width",
          orientation: "horizontal",
        },
        {
          type: "length",
          orientation: "vertical",
        },
      ],
    });

    return modelBuilder({
      model,
      trimModel: trimModel,
      dieline,
      bleed: {
        bleedAmount,
      },
      offsets,
      showAnchors,
      watermark: {
        show: showWatermark,
        offset: {
          x: glueSize,
          y: 0,
        },
      },
      material: selectedMaterial,
      showOverallDimensions,
    });
  },
};

export default tuckEnd;

function initiateModels() {
  const dieline: IModel = {};

  const trimModel: IModel = {};
  M.model.addModel(dieline, trimModel, "trim");
  M.model.layer(trimModel, "trim");

  const foldModel: IModel = {};
  M.model.addModel(dieline, foldModel, "fold");
  M.model.layer(foldModel, "fold");

  return {
    dieline,
    trimModel,
    foldModel,
  };
}
