import { addDoor } from "../core/helpers/add/addDoor";
import { addDust } from "../core/helpers/add/addDust";
import { addGlue } from "../core/helpers/add/addGlue";
import { cloneMirrorMove, cloneRotateMove } from "../core/helpers/clone";
import { drawFoldLines } from "../core/helpers/draw/drawFoldLines";
import { drawGuideLines } from "../core/helpers/draw/drawGuideLines";
import { drawSingleLines } from "../core/helpers/draw/drawSingleLines";
import { modelBuilder } from "../core/helpers/modelBuilder";
import { modelGenerator } from "../core/helpers/modelGenerator";
import { pushModelSeparatly } from "../core/helpers/pushModelSeparatly";
import { DOOR, materials, zero } from "../data/consts";
import { Dieline } from "../data/types";
import {} from "../utils/sizeConvertor";

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
      addGlue(trimModel, {
        height,
        width,
        length,
        safeFoldOffset: safeFoldOffset,
      });

      // DOOR ----------------------------
      const { tuckFlap } = DOOR;
      const tuckFlapSize = tuckFlap.size(width);

      const { model: topDoor, doorSize } = addDoor({
        width,
        height,
        length,
        tuckFlap,
        safeFoldOffset,
      });

      pushModelSeparatly(trimModel, foldModel, topDoor, "topDoor");

      const bottomDoor = cloneRotateMove(topDoor, 180, [
        width + height,
        -doorSize - safeFoldOffset,
      ]);

      pushModelSeparatly(trimModel, foldModel, bottomDoor, "bottomDoor");

      // DUST ----------------------------
      const { dustSize, model: dustTL } = addDust({
        drawAfter: topDoor,
        height,
        width,
        length,
        tuckFlapSize,
        safeFoldOffset,
      });

      pushModelSeparatly(trimModel, foldModel, dustTL, "dustTL");

      const { model: dustTR_RAW } = addDust({
        drawAfter: topDoor,
        height,
        width,
        length,
        tuckFlapSize,
        safeFoldOffset,
        considerDustHole: false,
      });

      const dustTR = cloneMirrorMove(dustTR_RAW, true, false, [
        width * 2 + height,
        length,
      ]);

      pushModelSeparatly(trimModel, foldModel, dustTR, "dustTR");

      const { model: dustBR_RAW } = addDust({
        drawAfter: topDoor,
        height,
        width,
        length,
        tuckFlapSize,
        safeFoldOffset,
        considerOuterIndent: false,
      });

      const clonedDustBR = cloneMirrorMove(dustBR_RAW, false, true, [
        width * 2 + height,
        0 - dustSize,
      ]);

      pushModelSeparatly(trimModel, foldModel, clonedDustBR, "dustBR");

      const { model: dustBL_RAW } = addDust({
        drawAfter: topDoor,
        height,
        width,
        length,
        tuckFlapSize,
        safeFoldOffset,
        considerOuterIndent: true,
      });

      const dustBL = cloneMirrorMove(dustBL_RAW, true, true, [
        width,
        0 - dustSize,
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
      const safeOffset = safeFoldOffset;
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
    }
  ),
};

export default homeDieline;
