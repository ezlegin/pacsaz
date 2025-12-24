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
import { getPathXYLength } from "./getPathXYLength";

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

  // ─────────────────────────────────────────
  // Dust part 1
  // ─────────────────────────────────────────
  const { xLength: widthOfDustHole } = getPathXYLength(dustHoleArc);
  const indentBL = considerDustHole
    ? addLineToHole
      ? Math.max(0, indent.bl - holeRadius)
      : 0
    : indent.bl;

  const { disOfHeight } = getDistanceOfFirstAndLastPoint(dustHoleArc, "path");
  const toTop = considerDustHole
    ? addLineToHole
      ? mappedDustSize - height.l + toMm(disOfHeight) - safeFoldOffset
      : mappedDustSize - safeFoldOffset
    : mappedDustSize - height.l;

  const startPointOfPart1 = getLastPointFromModel(drawAfter, "mm");
  const dustP1_PB = new PointBuilder(
    considerDustHole
      ? getLastPointFromPath(dustHoleArc, "mm")
      : [startPointOfPart1[0]!, startPointOfPart1[1]! - safeFoldOffset]
  );
  const dustP1_PTS = dustP1_PB
    .draw(
      indentBL,
      considerDustHole ? (addLineToHole ? height.l : 0) : height.l
    )
    .draw(indent.tl, toTop)
    .right(
      heightMM / 2 -
        indentBL -
        indent.tl -
        (considerDustHole ? toMm(widthOfDustHole) : 0)
    )
    .build();

  const dustP1 = addLine(dustP1_PTS, false);

  // ─────────────────────────────────────────
  // Dust part 2
  // ─────────────────────────────────────────
  const dustP2_PB = new PointBuilder(getLastPointMm(dustP1_PTS));

  const dustP2_PTS = dustP2_PB
    .right(
      heightMM / 2 -
        indent.br -
        indent.tr -
        (considerOuterIndent ? thickness : 0)
    )
    .draw(indent.tr, -mappedDustSize + height.r.inner)
    .draw(indent.br, -(height.r.inner - height.r.outer))
    .down(height.r.outer)
    .right(considerOuterIndent ? thickness : 0)
    .build();
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
      models: { dustP1, dustP2 },
      paths: considerDustHole ? { dustHoleArc } : {},
    },
    "trim"
  );

  return { model: dust, dustSize: mappedDustSize };
}
