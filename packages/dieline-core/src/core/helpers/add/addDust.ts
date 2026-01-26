import M, { IModel } from "makerjs";
import { calculateTuckflapSize } from "../calculate/calculateTuckflapSize";
import { getDistanceOfFirstAndLastPoint } from "../getDistance";
import { getLastPointFromModel, getLastPointFromPath } from "../getLastPoint";
import { PointBuilder } from "../pointBuilder";
import { addFoldLine } from "./addFoldLine";
import { addHoleArc } from "./addHoleArc";
import { addLine } from "./addLine";

interface AddDustParams {
  drawAfter: IModel;
  height: number;
  width: number;
  length: number;
  tuckFlapSize: number;
  considerOuterIndent?: boolean;
  considerDustHole?: boolean;
  materialThickness: number;
  safeFoldOffset: number;
}

export function addDust({
  drawAfter,
  width,
  length,
  height,
  tuckFlapSize,
  considerOuterIndent = true,
  considerDustHole = true,
  materialThickness,
  safeFoldOffset,
}: AddDustParams) {
  const doorSize = height + tuckFlapSize;
  const dustSize = doorSize / 2;
  const mappedDustSize = calculateTuckflapSize(width, dustSize, height);
  const dust: IModel = { models: {} };
  const startPoint = getLastPointFromModel(drawAfter);
  const dustHeight = {
    r: {
      inner: 9,
      outer: 6,
    },
  };
  const indent = {
    bl: materialThickness + 3,
    tl: materialThickness < 1.6 ? 1 : 2,
    tr: 5,
    br: 3,
  };

  // ─────────────────────────────────────────
  // Dust Hole
  // ─────────────────────────────────────────
  const { hole: dustHoleArc } = addHoleArc({
    startPoint: startPoint,
    safeFoldOffset,
  });

  // ─────────────────────────────────────────
  // Dust part 1
  // ─────────────────────────────────────────
  // Dust hole geometry measurements
  const { disOfHeight: dustHoleOuterHeight, disOfWidth: dustHoleWidth } =
    getDistanceOfFirstAndLastPoint(dustHoleArc, "path");

  // Indent calculations (bottom-left)
  const bottomLeftIndent = considerDustHole
    ? Math.max(0, indent.bl - dustHoleWidth)
    : indent.bl;

  // Vertical movement calculation
  const verticalMoveToTop = considerDustHole
    ? mappedDustSize - indent.bl
    : mappedDustSize - indent.bl;

  // Base-to-hole vertical compensation
  const baseToHoleEndOffset = safeFoldOffset - dustHoleOuterHeight;

  const dustStartPoint = considerDustHole
    ? getLastPointFromPath(dustHoleArc)
    : [startPoint[0]!, startPoint[1]! - safeFoldOffset];

  // Point construction
  const dustP1Builder = new PointBuilder(dustStartPoint);
  const dustP1_PTS = dustP1Builder
    .draw(
      bottomLeftIndent,
      considerDustHole ? indent.bl - baseToHoleEndOffset : indent.bl
    )
    .draw(indent.tl, verticalMoveToTop)
    .right(
      height -
        indent.br -
        bottomLeftIndent -
        indent.tl -
        indent.tr -
        (considerDustHole ? dustHoleWidth : 0) -
        (considerOuterIndent ? materialThickness : 0)
    )
    .draw(indent.tr, -mappedDustSize + dustHeight.r.inner)
    .draw(indent.br, -(dustHeight.r.inner - dustHeight.r.outer))
    .down(dustHeight.r.outer)
    .right(considerOuterIndent ? materialThickness : 0)
    .build();

  const dustP1 = addLine(dustP1_PTS, false, 35, [3]);

  // Adding models and paths to dust model
  M.model.addModel(
    dust,
    {
      models: { dustP1 },
      paths: considerDustHole ? { dustHoleArc } : {},
    },
    "trim"
  );

  // ─────────────────────────────────────────
  // Folds
  // ─────────────────────────────────────────
  const foldPoints = {
    from: [width, length],
    to: [
      width + height - (considerOuterIndent ? materialThickness : 0),
      length,
    ],
  };
  const foldTemp = new M.paths.Line([foldPoints.from, foldPoints.to]);
  const int = M.path.intersection(foldTemp, dustHoleArc) ?? {};
  const intPoints = int.intersectionPoints ?? [0, 0];
  const intOfFoldAndArc = intPoints[intPoints.length - 1]!;

  addFoldLine(dust, {
    id: "fold",
    from: considerDustHole ? intOfFoldAndArc : foldPoints.from,
    to: foldPoints.to,
  });

  return {
    model: dust,
    dustSize: mappedDustSize,
  };
}
