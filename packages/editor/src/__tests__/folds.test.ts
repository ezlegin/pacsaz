import { describe, expect, it } from "vitest";
import {
  compactFoldSteps,
  common,
  foldSteps,
  nextFoldStep,
  piecePlacement,
  setPanelFolds,
  setPiecePlacement,
  setPanelSteps,
  stepTimeline,
  withRest,
  type FoldPanel,
} from "../model/folds";

const panel = (faceIndex: number, valley = true, angle = 90): FoldPanel => ({ faceIndex, vertexCount: 4, valley, angle });
const [a, b, c] = [panel(1), panel(2), panel(3, false, 90)];

describe("fold authoring", () => {
  it("sets the direction and angle of several panels at once", () => {
    const folds = setPanelFolds(undefined, [a, b], { direction: "out", angle: 120 }, 10);
    expect(folds?.overrides).toEqual([
      { faceIndex: 1, direction: "out", angle: 120, vertexCount: 4 },
      { faceIndex: 2, direction: "out", angle: 120, vertexCount: 4 },
    ]);
    expect(folds?.faceCount).toBe(10);
  });

  it("stores nothing once every panel is automatic again", () => {
    const folds = setPanelFolds(undefined, [a], { direction: "out", angle: 120 }, 10);
    expect(setPanelFolds(folds, [a], "auto", 10)).toBeUndefined();
  });

  it("keeps the still panel and the resting side through edits", () => {
    const resting = withRest(undefined, "base", 10);
    expect(resting).toEqual({ faceCount: 10, rest: "base", overrides: [] });
    const folds = setPanelFolds({ ...resting!, rootFace: 4 }, [a], { direction: "in", angle: 180 }, 10);
    expect(folds).toMatchObject({ rootFace: 4, rest: "base" });
    expect(setPanelFolds(folds, [a], "auto", 10)).toEqual({ faceCount: 10, rootFace: 4, rest: "base", overrides: [] });
  });

  it("puts panels in a step at their inferred fold, which changes only when they fold", () => {
    const folds = setPanelSteps(undefined, [a, c], 1, 10);
    expect(folds?.overrides).toEqual([
      { faceIndex: 1, direction: "in", angle: 90, vertexCount: 4, step: 1 },
      { faceIndex: 3, direction: "out", angle: 90, vertexCount: 4, step: 1 },
    ]);
  });

  it("keeps an authored fold when its step changes, and its step when its fold changes", () => {
    let folds = setPanelFolds(undefined, [a], { direction: "out", angle: 45 }, 10);
    folds = setPanelSteps(folds, [a], 2, 10);
    expect(folds?.overrides[0]).toEqual({ faceIndex: 1, direction: "out", angle: 45, vertexCount: 4, step: 2 });
    folds = setPanelFolds(folds, [a], { direction: "in", angle: 135 }, 10);
    expect(folds?.overrides[0]).toEqual({ faceIndex: 1, direction: "in", angle: 135, vertexCount: 4, step: 2 });
    // Automatic again, it still folds in its step, at the inferred fold.
    folds = setPanelFolds(folds, [a], "auto", 10);
    expect(folds?.overrides[0]).toEqual({ faceIndex: 1, direction: "in", angle: 90, vertexCount: 4, step: 2 });
  });

  it("drops a fold that only held a step once the step is cleared", () => {
    const folds = setPanelSteps(setPanelSteps(undefined, [a], 1, 10), [a], null, 10);
    expect(folds).toBeUndefined();
    // An authored fold stays, without its step.
    const authored = setPanelSteps(setPanelSteps(setPanelFolds(undefined, [b], { direction: "out", angle: 30 }, 10), [b], 1, 10), [b], null, 10);
    expect(authored?.overrides).toEqual([{ faceIndex: 2, direction: "out", angle: 30, vertexCount: 4 }]);
  });

  it("lists the steps in order and finds the next one", () => {
    let folds = setPanelSteps(undefined, [c], 3, 10);
    folds = setPanelSteps(folds, [a, b], 1, 10);
    expect(foldSteps(folds)).toEqual([
      { step: 1, faces: [1, 2] },
      { step: 3, faces: [3] },
    ]);
    expect(nextFoldStep(folds)).toBe(4);
    expect(nextFoldStep(undefined)).toBe(1);
    // Renumbered without the hole.
    expect(foldSteps(compactFoldSteps(folds))).toEqual([
      { step: 1, faces: [1, 2] },
      { step: 2, faces: [3] },
    ]);
  });

  it("places a piece, keeps it through fold edits, and puts it back", () => {
    let folds = setPiecePlacement(undefined, 17, { x: 40, ry: 90 }, 10);
    expect(folds?.pieces).toEqual([{ face: 17, x: 40, y: 0, z: 0, rx: 0, ry: 90, rz: 0 }]);
    folds = setPiecePlacement(folds, 17, { y: 5 }, 10);
    expect(piecePlacement(folds, 17)).toEqual({ face: 17, x: 40, y: 5, z: 0, rx: 0, ry: 90, rz: 0 });
    // Fold edits keep it.
    folds = setPanelFolds(folds, [a], { direction: "out", angle: 30 }, 10);
    folds = setPanelSteps(folds, [a], 1, 10);
    expect(folds?.pieces).toHaveLength(1);
    folds = setPanelFolds(folds, [a], "auto", 10);
    expect(folds?.pieces).toHaveLength(1);
    // Back where the sheet puts it, nothing is left to store.
    folds = setPanelSteps(folds, [a], null, 10);
    expect(setPiecePlacement(folds, 17, null, 10)).toBeUndefined();
    // A piece moved back to zero by hand is not stored either.
    expect(setPiecePlacement(setPiecePlacement(undefined, 3, { z: 9 }, 10), 3, { z: 0 }, 10)).toBeUndefined();
    // An unplaced piece reads as the sheet's own place.
    expect(piecePlacement(undefined, 4)).toEqual({ face: 4, x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 });
  });

  it("agrees on a value only when every panel does", () => {
    expect(common([2, 2, 2])).toBe(2);
    expect(common([2, 3])).toBeUndefined();
  });

  it("finds where each step is finished on the fold slider", () => {
    const nodes = [{}, { step: 1 }, { step: 1 }, { step: 2 }, {}];
    const windows = [
      { start: 0, end: 1 },
      { start: 0, end: 0.2 },
      { start: 0, end: 0.2 },
      // A web: up with the walls, then on in its own step.
      { start: 0, end: 0.2, webThen: { start: 0.2, end: 0.4 } },
      { start: 0.4, end: 1 },
    ];
    expect(stepTimeline(nodes, windows)).toEqual([
      { step: 1, start: 0, end: 0.2 },
      { step: 2, start: 0.2, end: 0.4 },
    ]);
  });
});
