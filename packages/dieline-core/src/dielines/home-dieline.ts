import { addDoor } from "../core/helpers/add/addDoor";
import { addDust } from "../core/helpers/add/addDust";
import { addGlue } from "../core/helpers/add/addGlue";
import { cloneMirrorMove, cloneRotateMove } from "../core/helpers/clone";
import { drawFoldLines } from "../core/helpers/draw/drawFoldLines";
import { drawGuideLines } from "../core/helpers/draw/drawGuideLines";
import { drawSingleLines } from "../core/helpers/draw/drawSingleLines";
import { initiateModel } from "../core/helpers/initiateModels";
import { modelBuilder } from "../core/helpers/modelBuilder";
import { pushModelSeparatly } from "../core/helpers/pushModelSeparatly";
import { DOOR, materials, zero } from "../data/consts";
import { Dieline } from "../data/types";
import { toPt } from "../utils/sizeConvertor";

const homeDieline: Dieline = {
  slug: "home-dieline",
  title: "جعبه دو طرف درب", //todo: sync to database, not here.
  dimensions: {
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
    default: materials["glossy-cardboard"],
    included: [materials["glossy-cardboard"]],
  },
  model() {
    const {
      materialThickness,
      safeFoldOffset,
      height,
      width,
      model,
      foldModel,
      trimModel,
      guideModel,
      heightMM,
      length,
      lengthMM,
      widthMM,
    } = initiateModel();

    //! -------------- TRIM --------------

    // GLUE ----------------------------
    addGlue(trimModel, {
      heightMM,
      widthMM,
      lengthMM,
      safeFoldOffset: safeFoldOffset,
    });

    // DOOR ----------------------------
    const { tuckFlap } = DOOR;
    const tuckFlapSize = tuckFlap.size(widthMM);

    const { model: topDoor, doorSize } = addDoor({
      widthMM,
      heightMM,
      lengthMM,
      width,
      length,
      tuckFlap,
      materialThickness,
      safeFoldOffset,
    });

    pushModelSeparatly(trimModel, foldModel, topDoor, "topDoor");

    const bottomDoor = cloneRotateMove(topDoor, 180, [
      width + height,
      -doorSize - toPt(safeFoldOffset),
    ]);

    pushModelSeparatly(trimModel, foldModel, bottomDoor, "bottomDoor");

    // DUST ----------------------------
    const { dustSize, model: dustTL } = addDust({
      drawAfter: topDoor,
      heightMM,
      widthMM,
      lengthMM,
      tuckFlapSize,
      safeFoldOffset,
      materialThickness,
    });

    pushModelSeparatly(trimModel, foldModel, dustTL, "dustTL");

    const { model: dustTR_RAW } = addDust({
      drawAfter: topDoor,
      heightMM,
      widthMM,
      lengthMM,
      tuckFlapSize,
      safeFoldOffset,
      considerDustHole: false,
      materialThickness,
    });

    const dustTR = cloneMirrorMove(dustTR_RAW, true, false, [
      width * 2 + height,
      length,
    ]);

    pushModelSeparatly(trimModel, foldModel, dustTR, "dustTR");

    const { model: dustBR_RAW } = addDust({
      drawAfter: topDoor,
      heightMM,
      widthMM,
      lengthMM,
      tuckFlapSize,
      safeFoldOffset,
      considerOuterIndent: false,
      materialThickness,
    });

    const clonedDustBR = cloneMirrorMove(dustBR_RAW, false, true, [
      width * 2 + height,
      0 - toPt(dustSize),
    ]);

    pushModelSeparatly(trimModel, foldModel, clonedDustBR, "dustBR");

    const { model: dustBL_RAW } = addDust({
      drawAfter: topDoor,
      heightMM,
      widthMM,
      lengthMM,
      tuckFlapSize,
      materialThickness,
      safeFoldOffset,
      considerOuterIndent: true,
    });

    const dustBL = cloneMirrorMove(dustBL_RAW, true, true, [
      width,
      0 - toPt(dustSize),
    ]);

    pushModelSeparatly(trimModel, foldModel, dustBL, "dustBL");

    // SINGLES ----------------------------
    drawSingleLines(trimModel, [
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

    //! -------------- FOLD --------------
    const safeOffset = toPt(safeFoldOffset);
    drawFoldLines(foldModel, {
      verticals: [
        { from: zero, to: [0, length] },
        { from: [width, length + safeOffset], to: [width, 0] },
        {
          from: [width + height, length],
          to: [width + height, -safeOffset],
        },
        {
          from: [width * 2 + height, length],
          to: [width * 2 + height, -safeOffset],
        },
      ],
    });

    //! -------------- GUIDES --------------
    drawGuideLines(guideModel, {
      height,
      length,
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
          from: [width + height + width / 2, 0],
          to: [width + height + width / 2, length],
        },
      ],
    });

    return modelBuilder({
      model,
      trimModel,
      watermark: {
        offset: {
          x: 0,
          y: 0,
        },
      },
    });
  },
};

export default homeDieline;
