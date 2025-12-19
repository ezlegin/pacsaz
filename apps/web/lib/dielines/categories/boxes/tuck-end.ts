import { toMm, toPt } from "@/utils/sizeConvertor";
import M from "makerjs";
import { BLEED, GLUES, MARGINS, MATERIALS, zero } from "../../core/consts";
import { addAnchor } from "../../core/helpers/addAnchor";
import { addModelToLayer } from "../../core/helpers/addModelToLayer";
import { addBleed } from "../../core/helpers/bleedGenerator";
import { addContainer } from "../../core/helpers/containerGenerator";
import { addFoldLine } from "../../core/helpers/foldLineGenerator";
import { getLastPointMm } from "../../core/helpers/getLastPointMm";
import { addGuideLine } from "../../core/helpers/guidelineGenerator";
import { modelExporter } from "../../core/helpers/modelGenerator";
import { PointBuilder } from "../../core/helpers/pointBuilder";
import { DielineDefinition } from "../../core/types";

const tuckEnd: DielineDefinition = {
  slug: "postal-card",
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
    const fillet = M.chain.fillet(chain, 25);
    if (fillet) addModelToLayer(doorModelGroup, "fillet", fillet, "trim");

    const bottomDoor = M.model.moveRelative(
      M.model.zero(M.model.rotate(M.model.clone(doorModelGroup), 180)),
      [width + height, -height - toPt(tuckFlap.size)]
    );
    addModelToLayer(doorModelGroup, "bottomDoorModel", bottomDoor, "trim");

    addModelToLayer(trimModel, "door", doorModelGroup, "trim");

    // DUST
    const dustModelGroup: M.IModel = { models: {} };

    const dustPB = new PointBuilder(getLastPointMm(doorPTS));
    const dustPTS = dustPB.draw(dust.indent.bl, dust.height.l).build();
    const dustTL = new M.models.ConnectTheDots(false, dustPTS);
    addModelToLayer(dustModelGroup, "dust-tl", dustTL, "trim");

    const xPB = new PointBuilder(getLastPointMm(dustPTS));
    const xPTS = xPB
      .draw(dust.indent.tl, dust.size - dust.height.l)
      .right(heightMM - dust.indent.bl - dust.indent.tl - dust.indent.tr)
      .draw(dust.indent.tr - dust.indent.br, -dust.size + dust.height.r.inner)

      .build();
    const x = new M.models.ConnectTheDots(false, xPTS); //todo
    addModelToLayer(dustModelGroup, "x", x, "trim");

    const xChain = M.model.findSingleChain(x);
    const xFillet = M.chain.fillet(xChain, 5);
    if (fillet) addModelToLayer(dustModelGroup, "fillet", xFillet, "trim");

    const yPB = new PointBuilder(getLastPointMm(xPTS));
    const yPTS = yPB
      .draw(dust.indent.br, -(dust.height.r.inner - dust.height.r.outer))
      .down(dust.height.r.outer)
      .build();
    const y = new M.models.ConnectTheDots(false, yPTS);

    addModelToLayer(dustModelGroup, "y", y, "trim");

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

    addModelToLayer(trimModel, "dust", dustModelGroup, "trim");

    // POOR SINGLES
    const s1 = new M.models.ConnectTheDots(false, [zero, [width, 0]]);
    addModelToLayer(trimModel, "single-1", s1, "trim");

    const s2 = new M.models.ConnectTheDots(false, [
      [width + height, length],
      [width + height + width, length],
    ]);
    addModelToLayer(trimModel, "single-2", s2, "trim");

    const s3 = new M.models.ConnectTheDots(false, [
      [width * 2 + height * 2, length],
      [width * 2 + height * 2, 0],
    ]);
    addModelToLayer(trimModel, "single-3", s3, "trim");

    //! -------------- BLEED --------------
    const bleed = addBleed({
      model,
      trimModel,
      bleedAmount,
      connectorLine: { from: [0, 0], to: [0, length] },
    });

    //! -------------- ANCHOR --------------
    addAnchor(model, trimModel);

    //! -------------- FOLD --------------

    const foldModel: M.IModel = { models: {} };
    addModelToLayer(model, "folds", foldModel, "folds");

    addFoldLine(foldModel, {
      id: "fold-Vertical-1",
      from: zero,
      to: [0, length],
    });

    addFoldLine(foldModel, {
      id: "fold-Vertical-2",
      from: [width, length],
      to: [width, 0],
    });

    addFoldLine(foldModel, {
      id: "fold-Vertical-3",
      from: [width + height, length],
      to: [width + height, 0],
    });

    addFoldLine(foldModel, {
      id: "fold-Vertical-4",
      from: [width * 2 + height, length],
      to: [width * 2 + height, 0],
    });

    addFoldLine(doorModelGroup, {
      id: "fold-horizontal-1",
      from: [0, length + height],
      to: [width, length + height],
    });

    addFoldLine(foldModel, {
      id: "fold-horizontal-2",
      from: [width * 2 + height, length],
      to: [width * 2 + height * 2, length],
    });

    addFoldLine(foldModel, {
      id: "fold-horizontal-3",
      from: [0, length],
      to: [width + height, length],
    });

    addFoldLine(foldModel, {
      id: "fold-horizontal-4",
      from: [width, 0],
      to: [width * 2 + height * 2, 0],
    });

    addFoldLine(doorModelGroup, {
      id: "fold-horizontal-5",
      from: [width + height, -height],
      to: [width * 2 + height, -height],
    });

    //! --------------------------------- GUIDES
    const guidesModel: M.IModel = { models: {} };
    addModelToLayer(model, "guides", guidesModel, "guides");

    addGuideLine(guidesModel, {
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
    addGuideLine(guidesModel, {
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
    addGuideLine(guidesModel, {
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
      from: trimModel,
      marginMM: MARGINS.container,
    });

    return modelExporter({
      model,
      trim: trimModel,
      bleed,
      bleedAmount,
      container,
      offsets,
    });
  },
};

export default tuckEnd;
