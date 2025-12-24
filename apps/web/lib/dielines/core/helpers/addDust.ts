import { toMm, toPt } from "@/utils/sizeConvertor";
import M, { IModel } from "makerjs";
import { DUST, MaterialKey, MATERIALS } from "../consts";
import { addLine } from "./addLine";
import { addModelToLayer } from "./addModelToLayer";
import { calculateDustHoleSize } from "./calculateDustHoleSize";
import { addFoldLine } from "./foldLineGenerator";
import {
  getLastPointFromModel,
  getLastPointFromPath,
  getLastPointMm,
} from "./getLastPoint";
import { PointBuilder } from "./pointBuilder";
import { getDistanceOfFirstAndLastPoint } from "./getDistance";

interface AddDustParams {
  drawAfter: IModel;
  heightMM: number;
  widthMM: number;
  lengthMM: number;
  tuckFlapSize: number;
  material: MaterialKey;
  considerOuterIndent?: boolean;
  considerDustHole?: boolean;
}

export function addDust({
  drawAfter,
  heightMM,
  widthMM,
  lengthMM,
  tuckFlapSize,
  material,
  considerOuterIndent = true,
  considerDustHole = true,
}: AddDustParams) {
  const doorSize = heightMM + tuckFlapSize;
  const dustSize = doorSize / 2;
  const mappedDustSize = DUST.size(widthMM, dustSize, heightMM);
  const { indent, height } = DUST;
  const { thickness, safeFoldOffset } = MATERIALS[material];
  const dust: IModel = { models: {} };
  const startPoint = getLastPointFromModel(drawAfter, "pt");

  // ─────────────────────────────────────────
  // Dust Hole
  // ─────────────────────────────────────────
  const { holeRadius, addLineToHole, endAngle } =
    calculateDustHoleSize(safeFoldOffset);

  const arcStartPoint = [startPoint[0]! + toPt(holeRadius), startPoint[1]!];
  const dustHoleArc = new M.paths.Arc(
    arcStartPoint,
    toPt(holeRadius),
    180,
    endAngle
  );

  const dustHole_line_PB = new PointBuilder(
    getLastPointFromPath(dustHoleArc, "mm")
  );
  const indentBL = addLineToHole ? Math.max(0, indent.bl - holeRadius) : 0;

  const dustHole_line_PTS = dustHole_line_PB
    .draw(indentBL, addLineToHole ? height.l : 0)
    .build();
  const dustHoe_line = addLine(dustHole_line_PTS, false);

  const dustHole: IModel = {
    models: { dustHoe_line },
    paths: { dustHole: dustHoleArc },
  };

  // ─────────────────────────────────────────
  // Dust part 1
  // ─────────────────────────────────────────

  // in hole section, we went to right in:
  const { width: widthOfDustHole } = M.measure.modelExtents(dustHole);

  const dustP1_PB = new PointBuilder(
    addLineToHole
      ? getLastPointFromModel(dustHole, "mm")
      : getLastPointFromPath(dustHoleArc, "mm")
  );

  const { disOfHeight } = getDistanceOfFirstAndLastPoint(dustHoleArc, "path");

  const toTop = addLineToHole
    ? mappedDustSize - height.l + toMm(disOfHeight)
    : mappedDustSize;
  const dustP1_PTS = dustP1_PB
    .draw(indent.tl, toTop)
    .right(heightMM / 2 - toMm(widthOfDustHole) - indent.tl)
    .build();

  const dustP1 = addLine(dustP1_PTS, false);

  // ─────────────────────────────────────────
  // Dust part 1
  // ─────────────────────────────────────────
  const dustP2_PB = new PointBuilder(getLastPointMm(dustP1_PTS));

  const dustP2_PTS = dustP2_PB
    .right(
      heightMM / 2 - thickness - indent.br - indent.tr
      // (considerOuterIndent ? 0 : thickness) +
      // (considerDustHole ? 0 : thickness)
    )
    .draw(
      indent.tr,
      -mappedDustSize - safeFoldOffset + height.r.inner
      // considerDustHole
      //   ? -mappedDustSize - thickness + height.r.inner
      //   : -mappedDustSize + height.r.inner + thickness
    )
    .draw(indent.br, -(height.r.inner - height.r.outer))
    .down(height.r.outer)
    .right(considerOuterIndent ? thickness : 0)
    .build();
  // thickness + indentBR - indentTR
  const dustP2 = addLine(dustP2_PTS, false, 35);

  // ─────────────────────────────────────────
  // Folds
  // ─────────────────────────────────────────
  const foldPoints = {
    from: [toPt(widthMM), toPt(lengthMM)],
    to: [toPt(widthMM + heightMM - thickness), +toPt(lengthMM)],
  };
  const foldTemp = new M.paths.Line([foldPoints.from, foldPoints.to]);
  const int = M.path.intersection(foldTemp, dustHoleArc);
  const intPoints = int.intersectionPoints;
  const intOfFoldToArc = intPoints[intPoints.length - 1]!;

  addFoldLine(dust, {
    id: "dust-fold",
    from: intOfFoldToArc,
    to: foldPoints.to,
  });
  // ─────────────────────────────────────────
  // Layering
  // ─────────────────────────────────────────
  addModelToLayer(
    dust,
    "dust",
    {
      models: { dustHole, dustP1, dustP2 },
    },
    "trim"
  );

  return { model: dust, dustSize: mappedDustSize };
}
