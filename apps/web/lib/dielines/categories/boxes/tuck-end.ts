import { toMm, toPt } from "@/utils/sizeConvertor";
import M from "makerjs";
import { BLEED, GLUES, MATERIALS, zero } from "../../core/consts";
import { addFillet } from "../../core/helpers/addFillet";
import { addModelToLayer } from "../../core/helpers/addModelToLayer";
import { drawFoldLines } from "../../core/helpers/drawFoldLines";
import { drawGuideLines } from "../../core/helpers/drawGuideLines";
import { getLastPointMm } from "../../core/helpers/getLastPointMm";
import { modelBuilder } from "../../core/helpers/modelGenerator";
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
    developers: { showAnchors },
    dimensions: {
      raw: rawDim,
      resolved: { width, length, height, offsets },
    },
    dimensionType,
  }) {
    const model: M.IModel = { models: {} };
    const bleedAmount = toPt(BLEED.default);

    //! BLEED

    height = height ?? 0;

    //! TRIM
    const widthMM = toMm(width);
    const lengthMM = toMm(length);
    const heightMM = toMm(height);
    const glueSize = GLUES.sm;
    const glueMargin = 10;
    const tuckFlap = {
      size: 20,
      indent: 1,
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
        tl: 4,
        tr: 6,
        br: 3,
      },
    };

    //! -------------- TRIM --------------
    const trimModel: M.IModel = { models: {} };

    addModelToLayer(model, "trim", trimModel, "trim");

    // GLUE
    const gluePB = new PointBuilder();
    const gluePTS = gluePB
      .draw(-glueSize, glueMargin)
      .up(lengthMM - glueMargin * 2)
      .draw(glueSize, glueMargin);
    const glue = new M.models.ConnectTheDots(false, gluePTS.build());
    addModelToLayer(trimModel, "glue", glue, "trim");

    // DOOR
    const topPanelPB = new PointBuilder([0, lengthMM]);
    const topPanelPTS = topPanelPB
      .up(heightMM)
      .right(tuckFlap.indent)
      .up(tuckFlap.size)
      .right(widthMM - tuckFlap.indent * 2)
      .down(tuckFlap.size)
      .right(tuckFlap.indent)
      .down(heightMM)
      .build();
    const topPanel = new M.models.ConnectTheDots(false, topPanelPTS);

    addFillet(topPanel, 25);

    const bottomPanel = M.model.moveRelative(
      M.model.zero(M.model.rotate(M.model.clone(topPanel), 180)),
      [width + height, -height - toPt(tuckFlap.size)]
    );

    addModelToLayer(
      trimModel,
      "door",
      { models: { topPanel, bottomPanel } },
      "trim"
    );

    // DUST
    const dustTL: M.IModel = { models: {} };

    const dustP1_PB = new PointBuilder(getLastPointMm(topPanelPTS));
    const dustP1_PTS = dustP1_PB.draw(dust.indent.bl, dust.height.l).build();
    const dustP1 = new M.models.ConnectTheDots(false, dustP1_PTS);
    addModelToLayer(dustTL, "dust-tl", dustP1, "trim");

    const dustP2_PB = new PointBuilder(getLastPointMm(dustP1_PTS));
    const dustP2_PTS = dustP2_PB
      .draw(dust.indent.tl, dust.size - dust.height.l)
      .right(heightMM - dust.indent.bl - dust.indent.tl - dust.indent.tr)
      .draw(dust.indent.tr - dust.indent.br, -dust.size + dust.height.r.inner)

      .build();
    const dustP2 = new M.models.ConnectTheDots(false, dustP2_PTS); //todo

    addFillet(dustP2, 5);

    const dustP3_PB = new PointBuilder(getLastPointMm(dustP2_PTS));
    const dustP3_PTS = dustP3_PB
      .draw(dust.indent.br, -(dust.height.r.inner - dust.height.r.outer))
      .down(dust.height.r.outer)
      .build();
    const dustP3 = new M.models.ConnectTheDots(false, dustP3_PTS);

    addModelToLayer(
      dustTL,
      "dust-tl",
      { models: { dustP1, dustP2, dustP3 } },
      "trim"
    );

    const dustTR = M.model.moveRelative(
      M.model.zero(M.model.mirror(M.model.clone(dustTL), true, false)),
      [width * 2 + height, length]
    );

    const dustBR = M.model.moveRelative(
      M.model.zero(M.model.mirror(M.model.clone(dustTL), false, true)),
      [width * 2 + height, -toPt(dust.size)]
    );

    const dustBL = M.model.moveRelative(
      M.model.zero(M.model.mirror(M.model.clone(dustTL), true, true)),
      [width, -toPt(dust.size)]
    );

    addModelToLayer(
      trimModel,
      "dust",
      { models: { dustTL, dustTR, dustBR, dustBL } },
      "trim"
    );

    // POOR SINGLES
    const s1 = new M.models.ConnectTheDots(false, [zero, [width, 0]]);

    const s2 = new M.models.ConnectTheDots(false, [
      [width + height, length],
      [width + height + width, length],
    ]);

    const s3 = new M.models.ConnectTheDots(false, [
      [width * 2 + height * 2, length],
      [width * 2 + height * 2, 0],
    ]);

    const singles: M.IModel = { models: { s1, s2, s3 } };
    addModelToLayer(trimModel, "singles", singles, "trim");

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
          from: [0, length + height],
          to: [width, length + height],
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
          from: [width + height, -height],
          to: [width * 2 + height, -height],
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
      trim: trimModel,
      bleed: {
        bleedAmount,
        connectorLine: { from: [0, 0], to: [0, length] },
      },
      offsets,
      showAnchors,
    });
  },
};

export default tuckEnd;
