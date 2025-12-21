import { toPt } from "@/utils/sizeConvertor";
import M, { IModel } from "makerjs";
import { BLEED, GLUES, MATERIALS, zero } from "../../core/consts";
import { addLine } from "../../core/helpers/addLine";
import { addModelToLayer } from "../../core/helpers/addModelToLayer";
import { buildTrimModel } from "../../core/helpers/buildTrimModel";
import {
  cloneMirrorMove,
  cloneRotateMove,
} from "../../core/helpers/cloneMirrorMove";
import { createDielineContext } from "../../core/helpers/contextCreator";
import { drawFoldLines } from "../../core/helpers/drawFoldLines";
import { drawGuideLines } from "../../core/helpers/drawGuideLines";
import { drawSingleLines } from "../../core/helpers/drawSingleLines";
import { getLastPointMm } from "../../core/helpers/getLastPointMm";
import { addGlue } from "../../core/helpers/glueGenerator";
import { modelBuilder } from "../../core/helpers/modelBuilder";
import { PointBuilder } from "../../core/helpers/pointBuilder";
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
      MATERIALS["art-paper"],
    ],
  },
  model({
    developers: { showAnchors, showWatermark },
    dimensions: { raw: rawDim, resolved },
    dimensionType,
  }) {
    const model: IModel = { models: {} };
    const bleedAmount = toPt(BLEED.md);

    const { height, heightMM, length, offsets, lengthMM, width, widthMM } =
      createDielineContext(resolved);

    const glueSize = GLUES.sm;
    const glueMargin = 10;
    const tuckFlap = {
      size: 20,
      indent: 1,
      seam: {
        w: 8,
        h: 2,
      },
    };
    const dustSize = (heightMM + tuckFlap.size) / 2;
    const dust = {
      size: widthMM <= dustSize * 2 ? heightMM / 2 : dustSize,
      height: {
        l: 6,
        r: {
          inner: 12,
          outer: 8,
        },
      },
      indent: {
        bl: 5,
        tl: 3,
        tr: 6,
        br: 3,
      },
    };

    //! -------------- TRIM --------------

    // GLUE
    const glue = addGlue({
      normal: { size: glueSize, lengthMM, margin: glueMargin },
    });

    // DOOR
    const topPanelPB = new PointBuilder([0, lengthMM]);
    const topPanelPTS = topPanelPB
      .up(heightMM + tuckFlap.seam.h / 2)
      .right(tuckFlap.indent)
      .up(tuckFlap.size)
      .right(widthMM - tuckFlap.indent * 2)
      .down(tuckFlap.size)
      .right(tuckFlap.indent)
      .down(heightMM + tuckFlap.seam.h / 2)
      .build();

    const topDoor = addLine(topPanelPTS, false, 25);

    const seamPB = new PointBuilder([
      tuckFlap.indent,
      lengthMM + heightMM + tuckFlap.seam.h / 2,
    ]);
    const seamPTS = seamPB.right(tuckFlap.seam.w).down(tuckFlap.seam.h).build();
    const leftSeam = addLine(seamPTS, false, 3);

    const rightSeam = cloneMirrorMove(leftSeam, true, false, [
      width - toPt(tuckFlap.seam.w + tuckFlap.indent),
      length + height - tuckFlap.seam.h - tuckFlap.seam.h / 2,
    ]);

    const seamModel: IModel = { models: { leftSeam, rightSeam } };
    addModelToLayer(topDoor, "seam", seamModel, "trim");

    const bottomDoor = cloneRotateMove(topDoor, 180, [
      width + height,
      -height - toPt(tuckFlap.size + tuckFlap.seam.h / 2),
    ]);

    // DUST
    const dustTL: IModel = { models: {} };

    const dustP1_PB = new PointBuilder(getLastPointMm(topPanelPTS));
    const dustP1_PTS = dustP1_PB
      .draw(dust.indent.bl, dust.height.l)
      .draw(dust.indent.tl, dust.size - dust.height.l)
      .right(heightMM / 2 - dust.indent.bl - dust.indent.tl)
      .build();
    const dustP1 = new M.models.ConnectTheDots(false, dustP1_PTS);

    const dustP2_PB = new PointBuilder(getLastPointMm(dustP1_PTS));
    const dustP2_PTS = dustP2_PB
      .right(heightMM / 2 - dust.indent.tr)
      .draw(dust.indent.tr - dust.indent.br, -dust.size + dust.height.r.inner)
      .draw(dust.indent.br, -(dust.height.r.inner - dust.height.r.outer))
      .down(dust.height.r.outer)
      .build();
    const dustP2 = addLine(dustP2_PTS, false, 30);

    addModelToLayer(dustTL, "dust-tl", { models: { dustP1, dustP2 } }, "trim");

    const dustTR = cloneMirrorMove(dustTL, true, false, [
      width * 2 + height,
      length,
    ]);

    const dustBR = cloneMirrorMove(dustTL, false, true, [
      width * 2 + height,
      -toPt(dust.size),
    ]);

    const dustBL = cloneMirrorMove(dustTL, true, true, [
      width,
      -toPt(dust.size),
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
          from: [toPt(tuckFlap.seam.w + tuckFlap.indent), length + height],
          to: [
            width - toPt(tuckFlap.seam.w + tuckFlap.indent),
            length + height,
          ],
        },
        {
          from: [width * 2 + height, length],
          to: [width * 2 + height * 2, length],
        },
        {
          from: [0, length],
          to: [width + height, length],
        },
        {
          from: [width, 0],
          to: [width * 2 + height * 2, 0],
        },
        {
          from: [
            width + height + toPt(tuckFlap.seam.w + tuckFlap.indent),
            -height,
          ],
          to: [
            width * 2 + height - toPt(tuckFlap.indent + tuckFlap.seam.w),
            -height,
          ],
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
    });
  },
};

export default tuckEnd;
