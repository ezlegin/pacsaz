import { toPt } from "@/utils/sizeConvertor";
import { BLEED, DOOR, MATERIALS } from "@/core/consts";
import { addDoor } from "@/core/helpers/addDoor";
import { addDust } from "@/core/helpers/addDust";
import { addGlue } from "@/core/helpers/addGlue";
import { addSnapLock } from "@/core/helpers/addSnapLock";
import { cloneMirrorMove } from "@/core/helpers/cloneMirrorMove";
import { drawFoldLines } from "@/core/helpers/drawFoldLines";
import { drawGuideLines } from "@/core/helpers/drawGuideLines";
import { drawSingleLines } from "@/core/helpers/drawSingleLines";
import { initiateModel } from "@/core/helpers/initiateModels";
import { modelBuilder } from "@/core/helpers/modelBuilder";
import { pushModelSeparatly } from "@/core/helpers/pushModelSeparatly";
import { DielineGeneratorProps } from "@/core/types";

const tuckEndSnapLock: DielineGeneratorProps = {
  slug: "tuck-end-snap-lock",
  title: "جعبه اسنپ لاک", //todo: sync to database, not here.
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
    dimensions: {
      raw: rawDim,
      resolved,
      bleedSize,
      customThickness,
      container,
    },
    dimensionType,
    selectedMaterial,
  }) {
    const {
      materialThickness,
      safeFoldOffset,
      bleedAmount,
      height,
      width,
      model,
      foldModel,
      trimModel,
      guideModel,
      heightMM,
      length,
      lengthMM,
      offsets,
      widthMM,
    } = initiateModel({
      selectedMaterial,
      customThickness,
      bleedSize,
      resolved,
      defaultBleed: BLEED.default,
    });

    //! -------------- TRIM --------------

    // GLUE ----------------------------
    const { size: glueSize } = addGlue(trimModel, {
      heightMM,
      widthMM,
      customPoints: {
        from: [0, safeFoldOffset / 2],
        to: [0, lengthMM - safeFoldOffset / 2],
      },
      safeFoldOffset,
    });

    // DOOR ----------------------------
    const { tuckFlap } = DOOR;
    const tuckFlapSize = tuckFlap.size(widthMM);

    const { model: topDoor } = addDoor({
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

    // DUST ----------------------------
    const { model: dustTL } = addDust({
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

    const { snapLock } = addSnapLock({
      heightMM,
      widthMM,
      materialThickness,
      safeFoldOffset,
    });
    pushModelSeparatly(trimModel, foldModel, snapLock, "snapLock");

    // SINGLES ----------------------------
    drawSingleLines(trimModel, [
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
    const foldOffsetToSnapLock = toPt(safeFoldOffset) / 2;
    const safeOffset = toPt(safeFoldOffset);
    drawFoldLines(foldModel, {
      verticals: [
        { from: [0, foldOffsetToSnapLock], to: [0, length] },
        {
          from: [width, length + safeOffset],
          to: [width, foldOffsetToSnapLock],
        },
        {
          from: [width + height, length],
          to: [width + height, foldOffsetToSnapLock],
        },
        {
          from: [width * 2 + height, length],
          to: [width * 2 + height, foldOffsetToSnapLock],
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
      container,
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

export default tuckEndSnapLock;
