import { toPt } from "@/utils/sizeConvertor";
import { IModel } from "makerjs";
import { BLEED, DOOR, MATERIALS, zero } from "../../core/consts";
import { addDoor } from "../../core/helpers/addDoor";
import { addDust } from "../../core/helpers/addDust";
import { buildTrimModel } from "../../core/helpers/buildTrimModel";
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
import { DielineDefinition } from "../../core/types";

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
    developers: { showAnchors, showWatermark },
    dimensions: { raw: rawDim, resolved, bleedSize },
    dimensionType,
    selectedMaterial,
  }) {
    const model: IModel = { models: {} };
    const bleedAmount = bleedSize ? toPt(bleedSize) : toPt(BLEED.md);

    const { height, heightMM, length, offsets, lengthMM, width, widthMM } =
      createDielineContext(resolved);

    const { foldOffset: doorFoldOffset, tuckFlap } = DOOR;

    //! -------------- TRIM --------------

    // GLUE

    const glueMargin = 10;
    const { model: glue, size: glueSize } = addGlue({
      heightMM,
      widthMM,
      normal: { lengthMM, margin: glueMargin },
    });

    // DOOR
    const { model: topDoor } = addDoor({
      widthMM,
      heightMM,
      lengthMM,
      width,
      height,
      length,
      tuckFlap,
      withFingerHole: true,
    });

    const bottomDoor = cloneRotateMove(topDoor, 180, [
      width + height,
      -height - toPt(tuckFlap.size + tuckFlap.seam.h / 2),
    ]);

    // DUST
    const { dustSize, model: dustTL } = addDust({
      id: "dust-tl",
      drawAfter: topDoor,
      heightMM,
      widthMM,
      tuckFlapSize: tuckFlap.size,
    });

    const dustTR = cloneMirrorMove(dustTL, true, false, [
      width * 2 + height,
      length,
    ]);

    const dustBR = cloneMirrorMove(dustTL, false, true, [
      width * 2 + height,
      -toPt(dustSize),
    ]);

    const dustBL = cloneMirrorMove(dustTL, true, true, [
      width,
      -toPt(dustSize),
    ]);

    // SINGLES
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

    const trimModel = buildTrimModel({
      singles,
      glue,
      door: { models: { topDoor, bottomDoor } },
      dust: { models: { dustTL, dustTR, dustBR, dustBL } },
    });

    //! -------------- FOLD --------------
    drawFoldLines(model, {
      verticals: [
        { from: zero, to: [0, length] },
        { from: [width, length], to: [width, 0] },
        { from: [width + height, length], to: [width + height, 0] },
        {
          from: [width * 2 + height, length],
          to: [width * 2 + height, 0],
        },
      ],
      horizontals: [
        {
          from: [0, length + toPt(doorFoldOffset)],
          to: [width, length + toPt(doorFoldOffset)],
        },
        {
          from: [width, length],
          to: [width + height, length],
        },
        {
          from: [width * 2 + height, length],
          to: [width * 2 + height * 2, length],
        },
        {
          from: [width, 0],
          to: [width + height, 0],
        },
        {
          from: [width + height, -toPt(doorFoldOffset)],
          to: [width * 2 + height, -toPt(doorFoldOffset)],
        },
        {
          from: [width * 2 + height, 0],
          to: [width * 2 + height * 2, 0],
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

    console.log(model);
    return modelBuilder({
      model,
      trimModel,
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
    });
  },
};

export default tuckEnd;
