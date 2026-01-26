import { materials } from "@repo/store/data/dieline";
import { addDoor } from "../core/helpers/add/addDoor";
import { addDust } from "../core/helpers/add/addDust";
import { addGlue } from "../core/helpers/add/addGlue";
import { addSnapLock } from "../core/helpers/add/addSnapLock";
import { cloneMirrorMove } from "../core/helpers/clone";
import { drawFoldLines } from "../core/helpers/draw/drawFoldLines";
import { drawGuideLines } from "../core/helpers/draw/drawGuideLines";
import { drawSingleLines } from "../core/helpers/draw/drawSingleLines";
import { modelBuilder } from "../core/helpers/modelBuilder";
import { modelGenerator } from "../core/helpers/modelGenerator";
import { pushModelSeparatly } from "../core/helpers/pushModelSeparatly";
import { Dieline } from "../data/types";

const tuckEndSnapLock: Dieline = {
  slug: "tuck-end-snap-lock",
  title: "جعبه اسنپ لاک",
  dimensions: {
    defaultDimensions: {
      length: 250,
      width: 160,
      height: 80,
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
    included: [
      materials["glossy-cardboard"],
      materials["f-flute"],
      materials["e-flute"],
      materials["b-flute"],
    ],
  },

  model: modelGenerator(
    ({
      models: { foldModel, guideModel, model, trimModel },
      settings: {
        dimension: { height, length, width },
        safeFoldOffset,
      },
    }) => {
      //! -------------- TRIM --------------
      // GLUE ----------------------------
      const { size: glueSize } = addGlue(trimModel, {
        height,
        width,
        customPoints: {
          from: [0, safeFoldOffset / 2],
          to: [0, length - safeFoldOffset / 2],
        },
      });

      // DOOR ----------------------------

      const { model: topDoor } = addDoor(); //todo: have a drawAfter here as well

      pushModelSeparatly(trimModel, foldModel, topDoor, "topDoor");

      // DUST ----------------------------
      const { model: dustTL } = addDust({
        drawAfter: topDoor,
      });

      pushModelSeparatly(trimModel, foldModel, dustTL, "dustTL");

      const { model: dustTR_RAW } = addDust({
        drawAfter: topDoor,
        considerDustHole: false,
      });

      const dustTR = cloneMirrorMove(dustTR_RAW, true, false, [
        width * 2 + height,
        length,
      ]);

      pushModelSeparatly(trimModel, foldModel, dustTR, "dustTR");

      const { snapLock } = addSnapLock();
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
      const foldOffsetToSnapLock = safeFoldOffset / 2;
      drawFoldLines(foldModel, {
        verticals: [
          { from: [0, foldOffsetToSnapLock], to: [0, length] },
          {
            from: [width, length + safeFoldOffset],
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
          },
        ],
      });

      return modelBuilder({
        model,
        trimModel,
        watermark: {
          offset: {
            x: glueSize,
            y: 0,
          },
        },
      });
    }
  ),
};

export default tuckEndSnapLock;
