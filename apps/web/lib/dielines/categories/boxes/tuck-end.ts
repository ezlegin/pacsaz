import { toPt } from "@/utils/sizeConvertor";
import { initiateModels } from "lib/dielines/core/helpers/initiateModels";
import { BLEED, DOOR, MATERIALS, zero } from "../../core/consts";
import { addDoor } from "../../core/helpers/addDoor";
import { addDust } from "../../core/helpers/addDust";
import {
  cloneMirrorMove,
  cloneRotateMove,
} from "../../core/helpers/cloneMirrorMove";
import { createDielineContext } from "../../core/helpers/contextCreator";
import { drawFoldLines } from "../../core/helpers/drawFoldLines";
import { drawGuideLines } from "../../core/helpers/drawGuideLines";
import { drawSingleLines } from "../../core/helpers/drawSingleLines";
import { addGlue } from "../../core/helpers/glueGenerator";
import { modelBuilder } from "../../core/helpers/modelBuilder";
import { pushModelSeparatly } from "../../core/helpers/pushModelSeparatly";
import { DielineGeneratorProps } from "../../core/types";

const tuckEnd: DielineGeneratorProps = {
  slug: "tuck-end",
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
    const bleedAmount = bleedSize ? toPt(bleedSize) : toPt(BLEED.md);

    const { height, heightMM, length, offsets, lengthMM, width, widthMM } =
      createDielineContext(resolved);

    const { model, foldModel, trimModel, guideModel } = initiateModels();

    //! -------------- TRIM --------------

    // GLUE ----------------------------
    const glueMargin = 10;
    const { size: glueSize } = addGlue(trimModel, {
      heightMM,
      widthMM,
      normal: { lengthMM, margin: glueMargin },
      safeFoldOffset: mateial.safeFoldOffset,
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
      materialThickkness: mateial.thickness,
      safeFoldOffset: mateial.safeFoldOffset,
    });

    pushModelSeparatly(trimModel, foldModel, topDoor, "topDoor");

    const bottomDoor = cloneRotateMove(topDoor, 180, [
      width + height,
      -doorSize - toPt(mateial.safeFoldOffset),
    ]);

    pushModelSeparatly(trimModel, foldModel, bottomDoor, "bottomDoor");

    // DUST ----------------------------
    const { dustSize, model: dustTL } = addDust({
      drawAfter: topDoor,
      heightMM,
      widthMM,
      lengthMM,
      tuckFlapSize,
      material: selectedMaterial,
    });

    pushModelSeparatly(trimModel, foldModel, dustTL, "dustTL");

    const { model: dustTR_RAW } = addDust({
      drawAfter: topDoor,
      heightMM,
      widthMM,
      lengthMM,
      tuckFlapSize,
      material: selectedMaterial,
      considerDustHole: false,
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
      material: selectedMaterial,
      considerOuterIndent: false,
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
      material: selectedMaterial,
      considerOuterIndent: false,
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
    const safeOffset = toPt(mateial.safeFoldOffset);
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
      trimModel,
      bleedAmount,
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
