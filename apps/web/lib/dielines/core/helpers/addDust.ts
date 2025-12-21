import M, { IModel } from "makerjs";
import { DUST } from "../consts";
import { addLine } from "./addLine";
import { addModelToLayer } from "./addModelToLayer";
import { getLastPointMm } from "./getLastPointMm";
import { PointBuilder } from "./pointBuilder";

interface AddDustParams {
  id: string;
  drawAfter: IModel;
  heightMM: number;
  widthMM: number;
  tuckFlapSize: number;
}

export function addDust({
  drawAfter,
  heightMM,
  widthMM,
  tuckFlapSize,
  id,
}: AddDustParams) {
  const doorSize = heightMM + tuckFlapSize;
  const dustSize = doorSize / 2;
  const mappedDustSize = DUST.size(widthMM, dustSize, heightMM);
  const { indent, height } = DUST;

  const dust: IModel = { models: {} };

  // ─────────────────────────────────────────
  // Dust part 1
  // ─────────────────────────────────────────
  const chain = M.model.findSingleChain(drawAfter);
  M.chain.reverse(chain);
  const pts = M.chain.toKeyPoints(chain);
  const dustP1_PB = new PointBuilder(getLastPointMm(pts));

  const dustP1_PTS = dustP1_PB
    .draw(indent.bl, height.l)
    .draw(indent.tl, mappedDustSize - height.l)
    .right(heightMM / 2 - indent.bl - indent.tl)
    .build();

  const dustP1 = new M.models.ConnectTheDots(false, dustP1_PTS);

  // ─────────────────────────────────────────
  // Dust part 2
  // ─────────────────────────────────────────
  const dustP2_PB = new PointBuilder(getLastPointMm(dustP1_PTS));

  const dustP2_PTS = dustP2_PB
    .right(heightMM / 2 - indent.tr)
    .draw(indent.tr - indent.br, -mappedDustSize + height.r.inner)
    .draw(indent.br, -(height.r.inner - height.r.outer))
    .down(height.r.outer)
    .build();

  const dustP2 = addLine(dustP2_PTS, false, 30);

  // ─────────────────────────────────────────
  // Layering
  // ─────────────────────────────────────────
  addModelToLayer(dust, id, { models: { dustP1, dustP2 } }, "trim");

  return { model: dust, dustSize: mappedDustSize };
}
