import { toMm, toPt } from "@/utils/sizeConvertor";
import M, { IModel } from "makerjs";
import { DUST } from "../consts";
import { createHoleArc } from "./addHoleArc";
import { addLine } from "./addLine";
import { getDistanceOfFirstAndLastPoint } from "./getDistance";
import {
  getLastPointFromModel,
  getLastPointFromPath,
  getLastPointMm,
} from "./getLastPoint";
import { getPathXYLength } from "./getPathXYLength";
import { PointBuilder } from "./pointBuilder";

interface AddDustParams {
  drawAfter: IModel;
  heightMM: number;
  widthMM: number;
  lengthMM: number;
  tuckFlapSize: number;
  considerOuterIndent?: boolean;
  considerDustHole?: boolean;
  materialThickness: number;
  safeFoldOffset: number;
}

export function addDust({
  drawAfter,
  heightMM,
  widthMM,
  lengthMM,
  tuckFlapSize,
  considerOuterIndent = true,
  considerDustHole = true,
  materialThickness,
  safeFoldOffset,
}: AddDustParams) {
  const doorSize = heightMM + tuckFlapSize;
  const dustSize = doorSize / 2;
  const mappedDustSize = DUST.size(widthMM, dustSize, heightMM);
  const { indent, height } = DUST;
  const dust: IModel = { models: {} };
  const startPoint = getLastPointFromModel(drawAfter, "pt");

  // ─────────────────────────────────────────
  // Dust Hole
  // ─────────────────────────────────────────
  const {
    hole: dustHoleArc,
    holeRadius,
    addLineToHole,
  } = createHoleArc({
    startPoint,
    safeFoldOffset,
  });

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
        (considerOuterIndent ? materialThickness : 0)
    )
    .draw(indent.tr, -mappedDustSize + height.r.inner)
    .draw(indent.br, -(height.r.inner - height.r.outer))
    .down(height.r.outer)
    .right(considerOuterIndent ? materialThickness : 0)
    .build();
  const dustP2 = addLine(dustP2_PTS, false, 35);

  M.model.addModel(
    dust,
    {
      models: { dustP1, dustP2 },
      paths: considerDustHole ? { dustHoleArc } : {},
    },
    "trim"
  );

  // ─────────────────────────────────────────
  // Folds
  // ─────────────────────────────────────────
  const foldPoints = {
    from: [toPt(widthMM), toPt(lengthMM)],
    to: [
      toPt(widthMM + heightMM - (considerOuterIndent ? materialThickness : 0)),
      +toPt(lengthMM),
    ],
  };
  const foldTemp = new M.paths.Line([foldPoints.from, foldPoints.to]);
  const int = M.path.intersection(foldTemp, dustHoleArc) ?? {};
  const intPoints = int.intersectionPoints ?? [0, 0];
  const intOfFoldToArc = intPoints[intPoints.length - 1]!;

  const fold = new M.paths.Line([
    considerDustHole ? intOfFoldToArc : foldPoints.from,
    foldPoints.to,
  ]);
  M.path.addTo(fold, dust, "fold");

  return {
    model: dust,
    dustSize: mappedDustSize,
  };
}
