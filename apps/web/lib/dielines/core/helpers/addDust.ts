import { toPt } from "@/utils/sizeConvertor";
import M, { IModel } from "makerjs";
import { DUST, MaterialKey, MATERIALS } from "../consts";
import { addLine } from "./addLine";
import { addModelToLayer } from "./addModelToLayer";
import { addFoldLine } from "./foldLineGenerator";
import { getLastPointMm } from "./getLastPointMm";
import { PointBuilder } from "./pointBuilder";

interface AddDustParams {
  id: string;
  drawAfter: IModel;
  heightMM: number;
  widthMM: number;
  lengthMM: number;
  tuckFlapSize: number;
  material: MaterialKey;
}

export function addDust({
  drawAfter,
  heightMM,
  widthMM,
  lengthMM,
  tuckFlapSize,
  id,
  material,
}: AddDustParams) {
  const doorSize = heightMM + tuckFlapSize;
  const dustSize = doorSize / 2;
  const mappedDustSize = DUST.size(widthMM, dustSize, heightMM);
  const { indent, height } = DUST;
  const { thickness, safeFoldOffset } = MATERIALS[material];
  const dust: IModel = { models: {} };

  const xx = thickness - safeFoldOffset;

  // ─────────────────────────────────────────
  // Dust part 1
  // ─────────────────────────────────────────
  const chain = M.model.findSingleChain(drawAfter);
  M.chain.reverse(chain);
  const pts = M.chain.toKeyPoints(chain);
  const dustP1_PB = new PointBuilder(getLastPointMm(pts));

  const dustP1_PTS = dustP1_PB
    .down(thickness)
    .right(thickness * 2)
    .draw(indent.bl - thickness, thickness * 2 + height.l)
    .build();

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
    .right(heightMM / 2 - indent.tr - indent.br)
    .draw(
      +indent.tr - thickness,
      -mappedDustSize - thickness + height.r.inner + xx
    )
    .draw(indent.br, -(height.r.inner - height.r.outer))
    .down(height.r.outer)
    .right(thickness)
    .build();

  const dustP3 = addLine(dustP3_PTS, false, 30);

  // ─────────────────────────────────────────
  // Layering
  // ─────────────────────────────────────────

  addModelToLayer(dust, "dust", { models: { dustP1, dustP2, dustP3 } }, "trim");

  addFoldLine(dust, {
    id: "dust-fold2",
    from: [toPt(widthMM + indent.bl), toPt(lengthMM)],
    to: [toPt(widthMM + heightMM - thickness), +toPt(lengthMM)],
  });

  return { model: dust, dustSize: mappedDustSize };
}
