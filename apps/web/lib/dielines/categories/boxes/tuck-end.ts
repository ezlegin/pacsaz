import { toMm, toPt } from "@/utils/sizeConvertor";
import M from "makerjs";
import { BLEED, GLUES, MARGINS, MATERIALS, zero } from "../../core/consts";
import { addContainer } from "../../core/helpers/containerGenerator";
import { addFoldLine } from "../../core/helpers/foldLineGenerator";
import { modelExporter } from "../../core/helpers/modelGenerator";
import { DielineDefinition } from "../../core/types";
import { addModelToLayer } from "../../core/helpers/addModelToLayer";
import { PointBuilder } from "../../core/helpers/pointBuilder";
import { getLastPointMm } from "../../core/helpers/getLastPointMm";
import { addGuideLine } from "../../core/helpers/guidelineGenerator";

const tuckEnd: DielineDefinition = {
  slug: "postal-card",
  title: "جعبه دو طرف درب", //todo: sync to database, not here.
  dimensions: {
    initialScale: 1.5,
    defaultDimensions: {
      length: 140,
      width: 90,
      height: 40,
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
    dimensions: {
      raw: rawDim,
      resolved: { width, length, height, offsets },
    },
    dimensionType,
  }) {
    const model: M.IModel = { models: {} };
    const bleedAmount = toPt(BLEED.default);

    const rect = new M.models.Rectangle(width * 2, length);

    //! BLEED
    const bleed = M.model.outline(rect, bleedAmount, 1);
    // addModelToLayer(model, "bleed", bleed, "bleed");

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
    const dust = {
      size: (heightMM + tuckFlap.size) / 2,
      l: {
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
      },
      r: {
        height: {
          l: {
            inner: 12,
            outer: 8,
          },
          r: 6,
        },
        indent: {
          bl: 3,
          tl: 6,
          tr: 4,
          br: 5,
        },
      },
    };

    //! --------------------------------- TRIM
    // GLUE
    const gluePB = new PointBuilder();
    const gluePTS = gluePB
      .draw(-glueSize, glueMargin)
      .up(lengthMM - glueMargin * 2)
      .draw(glueSize, glueMargin);
    const glue = new M.models.ConnectTheDots(false, gluePTS.build());
    addModelToLayer(model, "glue", glue, "trim");

    // DOOR
    const doorModelGroup: M.IModel = { models: {} };

    const doorPB = new PointBuilder([0, lengthMM]);
    const doorPTS = doorPB
      .up(heightMM)
      .right(tuckFlap.indent)
      .up(tuckFlap.size)
      .right(widthMM - tuckFlap.indent * 2)
      .down(tuckFlap.size)
      .right(tuckFlap.indent)
      .down(heightMM)
      .build();
    const topDoor = new M.models.ConnectTheDots(false, doorPTS);
    addModelToLayer(doorModelGroup, "door_P1", topDoor, "trim");

    const chain = M.model.findSingleChain(topDoor);
    const fillet = M.chain.fillet(chain, 20);
    if (fillet) addModelToLayer(doorModelGroup, "fillet", fillet, "trim");

    addFoldLine(doorModelGroup, {
      id: "fold-door",
      from: [0, length + height],
      to: [width, length + height],
    });

    const bottomDoor = M.model.moveRelative(
      M.model.zero(M.model.rotate(M.model.clone(doorModelGroup), 180)),
      [width + height, -height - toPt(tuckFlap.size)]
    );
    addModelToLayer(doorModelGroup, "bottomDoorModel", bottomDoor, "trim");

    addModelToLayer(model, "door", doorModelGroup, "trim");

    // DUST
    const dustModelGroup: M.IModel = { models: {} };

    const dustPB = new PointBuilder(getLastPointMm(doorPTS));
    const dustPTS = dustPB
      .draw(dust.l.indent.bl, dust.l.height.l) // Start Left Dust Flap
      .draw(dust.l.indent.tl, dust.size - dust.l.height.l)
      .right(heightMM - dust.l.indent.bl - dust.l.indent.tl - dust.l.indent.tr)
      .draw(
        dust.l.indent.tr - dust.l.indent.br,
        -dust.size + dust.l.height.r.inner
      )
      .draw(dust.l.indent.br, -(dust.l.height.r.inner - dust.l.height.r.outer))
      .down(dust.l.height.r.outer);
    const dustTL = new M.models.ConnectTheDots(false, dustPTS.build());
    addModelToLayer(dustModelGroup, "dust-tl", dustTL, "trim");

    const dustTR = M.model.moveRelative(
      M.model.zero(M.model.mirror(M.model.clone(dustModelGroup), true, false)),
      [width * 2 + height, length]
    );

    const dustBR = M.model.moveRelative(
      M.model.zero(M.model.mirror(M.model.clone(dustModelGroup), false, true)),
      [width * 2 + height, -toPt(dust.size)]
    );

    const dustBL = M.model.moveRelative(
      M.model.zero(M.model.mirror(M.model.clone(dustModelGroup), true, true)),
      [width, -toPt(dust.size)]
    );

    addModelToLayer(dustModelGroup, "dust-tr", dustTR, "trim");
    addModelToLayer(dustModelGroup, "dust-br", dustBR, "trim");
    addModelToLayer(dustModelGroup, "dust-bl", dustBL, "trim");

    addModelToLayer(model, "dust", dustModelGroup, "trim");

    // POOR SINGLES
    const s1 = new M.models.ConnectTheDots(false, [zero, [width, 0]]);
    addModelToLayer(model, "single-1", s1, "trim");

    const s2 = new M.models.ConnectTheDots(false, [
      [width + height, length],
      [width + height + width, length],
    ]);
    addModelToLayer(model, "single-2", s2, "trim");

    const s3 = new M.models.ConnectTheDots(false, [
      [width * 2 + height * 2, length],
      [width * 2 + height * 2, 0],
    ]);
    addModelToLayer(model, "single-3", s3, "trim");

    //! --------------------------------- FOLD
    addFoldLine(model, {
      id: "fold-Vertical-1",
      from: zero,
      to: [0, length],
    });

    console.log(model);

    addFoldLine(model, {
      id: "fold-Vertical-2",
      from: [width, length],
      to: [width, 0],
    });

    addFoldLine(model, {
      id: "fold-Vertical-3",
      from: [width + height, length],
      to: [width + height, 0],
    });

    addFoldLine(model, {
      id: "fold-Vertical-4",
      from: [width * 2 + height, length],
      to: [width * 2 + height, 0],
    });

    addFoldLine(model, {
      id: "fold-horizontal-1",
      from: [width * 2 + height, length],
      to: [width * 2 + height * 2, length],
    });

    addFoldLine(model, {
      id: "fold-horizontal-2",
      from: [0, length],
      to: [width + height, length],
    });

    addFoldLine(model, {
      id: "fold-horizontal-3",
      from: [width, 0],
      to: [width * 2 + height * 2, 0],
    });

    // //! GUIDES
    addGuideLine(model, {
      type: "height",
      from: [width, length / 2],
      to: [width + height, length / 2],
      value: rawDim.height,
      orientation: "horizontal",
      dimensionType,
      dimensionTypeOffset: {
        widthOffset: offsets.width,
        lengthOffset: offsets.length,
      },
    });
    addGuideLine(model, {
      type: "width",
      from: [0, length / 4],
      to: [width, length / 4],
      value: rawDim.width,
      orientation: "horizontal",
      dimensionType,
      dimensionTypeOffset: {
        widthOffset: offsets.width,
        lengthOffset: offsets.length,
      },
    });
    addGuideLine(model, {
      type: "length",
      from: [width / 4, 0],
      to: [width / 4, length],
      value: rawDim.length,
      orientation: "vertical",
      dimensionType,
      dimensionTypeOffset: {
        widthOffset: offsets.width,
        lengthOffset: offsets.length,
      },
    });

    const container = addContainer({
      model,
      from: rect,
      marginMM: MARGINS.container,
    });

    return modelExporter({
      model,
      trim: {}, // todo
      bleed,
      bleedAmount,
      container,
      offsets,
    });
  },
};

export default tuckEnd;

// const points = pb
//   .draw(-glue, glueMargin) // GLUE

//   .up(lengthMM - glueMargin * 2) // Start Top Panel
//   .draw(glue, glueMargin)
//   .up(heightMM)

//   .right(tuckFlap.indent) // Start Top Tuck Flap
//   .up(tuckFlap.size)
//   .right(widthMM - tuckFlap.indent * 2)
//   .down(tuckFlap.size)
//   .right(tuckFlap.indent) // End Top Tuck Flap

//   .down(heightMM) // End Top Panel

//   .draw(dust.l.indent.bl, dust.l.height.l) // Start Left Dust Flap
//   .draw(dust.l.indent.tl, dust.size - dust.l.height.l)
//   .right(heightMM - dust.l.indent.bl - dust.l.indent.tl - dust.l.indent.tr)
//   .draw(
//     dust.l.indent.tr - dust.l.indent.br,
//     -dust.size + dust.l.height.r.inner
//   )
//   .draw(dust.l.indent.br, -(dust.l.height.r.inner - dust.l.height.r.outer))
//   .down(dust.l.height.r.outer) // End Left Dust Flap

//   .right(widthMM)

//   .up(dust.r.height.l.outer)
//   .draw(dust.r.indent.bl, dust.r.height.l.inner - dust.r.height.l.outer)
//   .draw(
//     dust.r.indent.tl - dust.r.indent.bl,
//     dust.size - dust.r.height.l.inner
//   )
//   .right(heightMM - dust.r.indent.tl - dust.r.indent.tr - dust.r.indent.br)
//   .draw(dust.r.indent.tr, -(dust.size - dust.r.indent.br))
//   .draw(dust.r.indent.br, -dust.r.indent.br) // Start right Dust Flap

//   .down(lengthMM);

// const trim = new M.models.ConnectTheDots(false, points.build());
// addModelToLayer(model, "trim", trim, "trim");
