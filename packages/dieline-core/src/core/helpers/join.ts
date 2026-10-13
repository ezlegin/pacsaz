import { ISpec } from "@repo/store/types";
import M, { IPathArc } from "makerjs";

interface ChainEndpoints {
  start: M.IPoint;
  end: M.IPoint;
}

interface ChainEndpoints {
  start: M.IPoint;
  end: M.IPoint;
}

function collectPath(model: M.IModel): M.IPath[] {
  const out: M.IPath[] = [];
  const walk = (node: M.IModel) => {
    if (node.paths) {
      const path = Object.values(node.paths)[0]!;
      const cloned = M.path.clone(path);
      M.path.move(cloned, node.origin ?? [0, 0]);

      out.push({ ...cloned });
    }
    if (node.models) {
      for (const child of Object.values(node.models)) walk(child);
    }
  };
  walk(model);
  return out;
}

function endpointsOf(model: M.IModel): ChainEndpoints | null {
  const chain = M.model.findSingleChain(model);
  if (chain && !chain.endless) {
    const points = M.chain.toKeyPoints(chain);
    if (points.length >= 2) {
      return { start: points[0]!, end: points.at(-1)! };
    }
  }

  const path = collectPath(model);
  if (path.length === 1) {
    const pa = path[0]!;
    if (pa.type === "arc") {
      const pts = M.point.fromArc(pa as IPathArc);
      return {
        start: pts[0]!,
        end: pts[1]!,
      };
    }
    return {
      start: M.path.toKeyPoints(pa)[0]!,
      end: M.path.toKeyPoints(pa)[1]!,
    };
  }

  return null;
}

function resolvePair(
  mode: ISpec.JoinMode,
  a: ChainEndpoints,
  b: ChainEndpoints,
): [M.IPoint, M.IPoint] {
  switch (mode) {
    case "a-start-b-start":
      return [a.start, b.start];
    case "a-start-b-end":
      return [a.start, b.end];
    case "a-end-b-start":
      return [a.end, b.start];
    case "a-end-b-end":
      return [a.end, b.end];

    case "nearest": {
      const bOptions: M.IPoint[] = [b.start, b.end];

      const aStartToB = M.point.closest(a.start, bOptions);
      const aEndToB = M.point.closest(a.end, bOptions);

      const dStart = M.measure.pointDistance(a.start, aStartToB);
      const dEnd = M.measure.pointDistance(a.end, aEndToB);

      return dStart <= dEnd ? [a.start, aStartToB] : [a.end, aEndToB];
    }
  }
}

export function applyJoin(
  children: M.IModel[],
  mode: ISpec.JoinMode,
): M.IModel {
  if (children.length !== 2) {
    console.warn(
      `[join] expected exactly 2 children, got ${children.length} — skipped`,
    );
    return { models: { child0: children[0]!, child1: children[1]! } };
  }

  const a = endpointsOf(children[0]!);
  const b = endpointsOf(children[1]!);

  if (!a || !b) {
    console.warn(
      "[join] one or both children are not single-chain models — skipped",
    );
    return { models: { child0: children[0]!, child1: children[1]! } };
  }

  const [p1, p2] = resolvePair(mode, a, b);

  const samePoint = M.measure.pointDistance(p1, p2) < 0.001;
  const connector = samePoint ? null : new M.paths.Line(p1, p2);

  const model: M.IModel = {
    models: {
      a: children[0]!,
      b: children[1]!,
    },
  };

  if (connector) model.paths = { connector };

  return model;
}
