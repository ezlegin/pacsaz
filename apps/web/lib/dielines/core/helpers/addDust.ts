import { toPt } from "@/utils/sizeConvertor";
import M, { IModel } from "makerjs";
import { DUST, MaterialKey, MATERIALS } from "../consts";
import { addLine } from "./addLine";
import { addModelToLayer } from "./addModelToLayer";
import { addFoldLine } from "./foldLineGenerator";
import { getLastPointMm } from "./getLastPointMm";
import { PointBuilder } from "./pointBuilder";

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

  const afterHoleSpace = thickness - safeFoldOffset;

  // ─────────────────────────────────────────
  // Dust part 1
  // ─────────────────────────────────────────
  const chain = M.model.findSingleChain(drawAfter);
  M.chain.reverse(chain);
  const pts = M.chain.toKeyPoints(chain);
  const startPoint = getLastPointMm(pts);

  const dustP1_PB = new PointBuilder(
    considerDustHole
      ? startPoint
      : [startPoint[0]!, startPoint[1]! - safeFoldOffset]
  );

  const dustP1_PTS = considerDustHole
    ? dustP1_PB
        .down(thickness)
        .right(thickness * 2)
        .draw(indent.bl - thickness, thickness * 2 + height.l)
        .build()
    : dustP1_PB.draw(indent.bl, height.l).build();

  const dustP1 = addLine(dustP1_PTS, false, 8.5);

  // ─────────────────────────────────────────
  // Dust part 2
  // ─────────────────────────────────────────
  const dustP2_PB = new PointBuilder(getLastPointMm(dustP1_PTS));

  const dustP2_PTS = dustP2_PB
    .draw(indent.tl, mappedDustSize - thickness - height.l)
    .right(heightMM / 2 - indent.bl - thickness - indent.tl)
    .build();

  const dustP2 = new M.models.ConnectTheDots(false, dustP2_PTS);

  // ─────────────────────────────────────────
  // Dust part 2
  // ─────────────────────────────────────────
  const dustP3_PB = new PointBuilder(getLastPointMm(dustP2_PTS));

  const dustP3_PTS = dustP3_PB
    .right(
      heightMM / 2 -
        indent.tr -
        indent.br +
        (considerOuterIndent ? 0 : thickness) +
        (considerDustHole ? 0 : thickness)
    )
    .draw(
      +indent.tr - thickness,
      considerDustHole
        ? -mappedDustSize - thickness + height.r.inner + afterHoleSpace
        : -mappedDustSize + height.r.inner + thickness
    )
    .draw(indent.br, -(height.r.inner - height.r.outer))
    .down(height.r.outer)
    .right(considerOuterIndent ? thickness : 0)
    .build();

  const dustP3 = addLine(dustP3_PTS, false, 30);

  // ─────────────────────────────────────────
  // Layering
  // ─────────────────────────────────────────

  addModelToLayer(dust, "dust", { models: { dustP1, dustP2, dustP3 } }, "trim");

  addFoldLine(dust, {
    id: "dust-fold",
    from: [toPt(widthMM + indent.bl), toPt(lengthMM)],
    to: [toPt(widthMM + heightMM - thickness), +toPt(lengthMM)],
  });

  return { model: dust, dustSize: mappedDustSize };
}
