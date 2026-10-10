import M, { IModel } from "makerjs";
import Pacsaz from "../Pacsaz";

export function addFillet(model: IModel, radius: number = 0): IModel {
  if (radius <= 0) return model;

  const chain = M.model.findSingleChain(model);
  if (!chain) return model;

  const fillet = retryFillet(chain, radius);

  return fillet ? { models: { fillet, model } } : model;
}

export function addFilletAt(
  model: IModel,
  indices: number[],
  radius: number = 0,
): IModel {
  if (radius <= 0 || indices.length === 0) return model;

  const chain = M.model.findSingleChain(model);
  if (!chain) return model;

  let kpts = M.chain.toKeyPoints(chain);
  const closed = isClosedChain(chain);
  if (closed && kpts.length > 1 && ptEq(kpts[0]!, kpts[kpts.length - 1]!)) {
    kpts = kpts.slice(0, -1);
  }

  const N = kpts.length;
  if (N < 3) return model;

  const filletSet = new Set(indices.filter((i) => i >= 0 && i < N));
  if (filletSet.size === 0) return model;

  const lineModel: IModel = { models: {} };
  const filletModel: IModel = { models: {} };

  const edgeCount = closed ? N : N - 1;
  for (let i = 0; i < edgeCount; i++) {
    const j = (i + 1) % N;
    if (filletSet.has(i) || filletSet.has(j)) continue;
    const seg = new M.models.ConnectTheDots(false, [kpts[i]!, kpts[j]!]);
    Pacsaz.shape.push(lineModel, `line-${i}-${j}`, seg);
  }

  for (const i of Array.from(filletSet).sort((a, b) => a - b)) {
    const prev = (i - 1 + N) % N;
    const next = (i + 1) % N;

    let pBefore = kpts[prev]!;
    let pAfter = kpts[next]!;

    if (filletSet.has(prev)) {
      pBefore = M.point.middle(new M.paths.Line(kpts[prev]!, kpts[i]!));
    }
    if (filletSet.has(next)) {
      pAfter = M.point.middle(new M.paths.Line(kpts[i]!, kpts[next]!));
    }

    const sub = new M.models.ConnectTheDots(false, [pBefore, kpts[i]!, pAfter]);
    const subChain = M.model.findSingleChain(sub);
    if (!subChain) continue;

    const fillet = retryFillet(subChain, radius);
    if (fillet) {
      Pacsaz.shape.push(filletModel, `fillet-${i}`, {
        models: { fillet, sub },
      });
    }
  }

  return {
    models: {
      line: lineModel,
      fillet: filletModel,
    },
  };
}

function retryFillet(chain: M.IChain, radius: number): IModel | null {
  const step = Math.max(0.05, radius / 50);
  for (let r = radius; r > 0.05; r -= step) {
    const f = M.chain.fillet(chain, r);
    if (f) return f;
  }
  return null;
}

function isClosedChain(chain: M.IChain): boolean {
  return (chain as any).endless === true;
}

function ptEq(a: M.IPoint, b: M.IPoint): boolean {
  return Math.abs(a[0]! - b[0]!) < 1e-6 && Math.abs(a[1]! - b[1]!) < 1e-6;
}
