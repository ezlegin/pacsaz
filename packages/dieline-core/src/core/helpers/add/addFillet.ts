import M, { IModel } from "makerjs";
import Pacsaz from "../../Pacsaz";

export function addFillet(model: IModel, radius: number = 0) {
  const chain = M.model.findSingleChain(model);
  if (!chain || radius <= 0) return;

  let fillet: IModel | null = null;

  for (let r = radius; r > 0; r -= 0.2) {
    fillet = M.chain.fillet(chain, r);
    if (fillet) break;
  }

  if (fillet) Pacsaz.shape.push(model, "fillet", fillet);
}

export function addFilletAt(
  model: IModel,
  indices: number[],
  radius: number = 0,
) {
  const filletModel: IModel = { models: {} };
  const lineModel: IModel = { models: {} };

  const chain = M.model.findSingleChain(model);
  M.chain.reverse(chain);
  const kpts = M.chain.toKeyPoints(chain);

  const sorted = indices
    .filter((i) => i > 0 && i < kpts.length - 1)
    .sort((a, b) => a - b);

  let cursor = 0;

  for (const index of sorted) {
    const pBefore = kpts[index - 1]!;
    const pFillet = kpts[index]!;
    const pAfter = kpts[index + 1]!;

    const beforePts = kpts.slice(cursor, index);
    if (beforePts.length >= 2) {
      const line = new M.models.ConnectTheDots(false, beforePts);
      Pacsaz.shape.push(lineModel, "line", line);
    }

    const overlappingIndex = sorted.filter(
      (s) => s === index + 1 || s === index - 1,
    );

    let filletLine: IModel = {};

    if (overlappingIndex.length < 1) {
      filletLine = new M.models.ConnectTheDots(false, [
        pBefore,
        pFillet,
        pAfter,
      ]);
    } else {
      if (overlappingIndex.length < 2) {
        const overlap = overlappingIndex[0]!;
        const isBefore = overlap < index;
        const isAfter = overlap > index;

        if (isAfter) {
          const path = new M.paths.Line([pFillet, pAfter]);
          const middle = M.point.middle(path);

          filletLine = new M.models.ConnectTheDots(false, [
            pBefore,
            pFillet,
            middle,
          ]);
        }

        if (isBefore) {
          const path = new M.paths.Line([pFillet, pBefore]);
          const middle = M.point.middle(path);

          filletLine = new M.models.ConnectTheDots(false, [
            middle,
            pFillet,
            pAfter,
          ]);
        }
      } else {
        const beforePath = new M.paths.Line([pBefore, pFillet]);
        const beforMiddle = M.point.middle(beforePath);

        const afterPath = new M.paths.Line([pAfter, pFillet]);
        const afterMiddle = M.point.middle(afterPath);

        filletLine = new M.models.ConnectTheDots(false, [
          beforMiddle,
          pFillet,
          afterMiddle,
        ]);
      }
    }

    const filletChain = M.model.findSingleChain(filletLine);
    if (!filletChain) throw new Error("Here");

    let fillet: IModel | null = null;
    for (let r = radius; r > 0; r--) {
      fillet = M.chain.fillet(filletChain, r);
      if (fillet) break;
    }

    if (fillet) {
      Pacsaz.shape.push(filletModel, "fillet", {
        models: { fillet, filletLine },
      });
    }

    cursor = index + 1;
  }

  const tailPts = kpts.slice(cursor);
  if (tailPts.length >= 2) {
    const tailLine = new M.models.ConnectTheDots(false, tailPts);
    Pacsaz.shape.push(lineModel, "line", tailLine);
  }

  return {
    models: {
      lineModel,
      filletModel,
    },
  };
}
