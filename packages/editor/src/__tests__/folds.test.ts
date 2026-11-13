import { describe, expect, it } from "vitest";
import {
  compactFoldSteps,
  deleteFoldStep,
  common,
  foldSteps,
  keepFoldPlace,
  nextFoldStep,
  hasPiecePlacement,
  piecePlacement,
  setPanelFolds,
  setPiecePlacement,
  setStandsOn,
  setPanelSteps,
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
      { step: 1, faces: [1, 2], moves: [] },
      { step: 3, faces: [3], moves: [] },
    ]);
    expect(nextFoldStep(folds)).toBe(4);
    expect(nextFoldStep(undefined)).toBe(1);
    // Renumbered without the hole.
    expect(foldSteps(compactFoldSteps(folds))).toEqual([
      { step: 1, faces: [1, 2], moves: [] },
      { step: 2, faces: [3], moves: [] },
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

  it("stands a piece on a chosen panel, keeping the rest of the settings", () => {
    let folds = setPanelFolds(undefined, [a], { direction: "out", angle: 30 }, 10);
    folds = setPiecePlacement(folds, 7, { x: 20 }, 10);
    // Piece of panels 5, 6, 7 (it stood on 7): now it stands on 5.
    folds = setStandsOn(folds, 5, [5, 6, 7], 10);
    expect(folds?.roots).toEqual([5]);
    expect(folds?.pieces).toEqual([{ face: 5, x: 20, y: 0, z: 0, rx: 0, ry: 0, rz: 0 }]);
    expect(folds?.overrides).toHaveLength(1);
    // Choosing again in the same piece replaces the choice; another piece adds one.
    folds = setStandsOn(folds, 6, [5, 6, 7], 10);
    folds = setStandsOn(folds, 1, [1, 2, 3], 10);
    expect(folds?.roots).toEqual([1, 6]);
    // The standing panel's own fold goes: it no longer folds.
    expect(folds?.overrides).toEqual([]);
    // Fold edits keep the choice.
    expect(setPanelSteps(folds, [b], 1, 10)?.roots).toEqual([1, 6]);
  });

  it("moves the template's still panel when its piece stands on another one", () => {
    const folds = setStandsOn({ faceCount: 10, rootFace: 3, overrides: [] }, 2, [1, 2, 3], 10);
    expect(folds).toMatchObject({ rootFace: 2, roots: [2] });
  });

  it("deletes a step: its panels go back to the automatic order, later steps move up", () => {
    let folds = setPanelSteps(undefined, [a], 1, 10);
    folds = setPanelFolds(folds, [b], { direction: "out", angle: 45 }, 10);
    folds = setPanelSteps(folds, [b], 2, 10);
    folds = setPanelSteps(folds, [c], 3, 10);
    folds = deleteFoldStep(folds, 2, [a, b, c], 10);
    // Panel b keeps its own fold, without a step; c moves up to step 2.
    expect(folds?.overrides).toEqual([
      { faceIndex: 1, direction: "in", angle: 90, vertexCount: 4, step: 1 },
      { faceIndex: 2, direction: "out", angle: 45, vertexCount: 4 },
      { faceIndex: 3, direction: "out", angle: 90, vertexCount: 4, step: 2 },
    ]);
    // A panel that only held its step is dropped altogether.
    expect(foldSteps(deleteFoldStep(folds, 1, [a, b, c], 10))).toEqual([{ step: 1, faces: [3], moves: [] }]);
    expect(deleteFoldStep(folds, 1, [a, b, c], 10)?.overrides.some((o) => o.faceIndex === 1)).toBe(false);
    // A step that does not exist changes nothing.
    expect(deleteFoldStep(folds, 9, [a, b, c], 10)).toBe(folds);
  });

  it("moves a piece in a step, from wherever it was before", () => {
    // Starts at x 0; by the end of step 2 it is at x 100.
    let folds = setPanelSteps(undefined, [a], 1, 10);
    folds = setPiecePlacement(folds, 7, { x: 100 }, 10, 2);
    expect(folds?.pieces).toEqual([{ face: 7, x: 100, y: 0, z: 0, rx: 0, ry: 0, rz: 0, step: 2 }]);
    expect(hasPiecePlacement(folds, 7, 2)).toBe(true);
    expect(hasPiecePlacement(folds, 7)).toBe(false);
    // In step 1 it has not moved yet; in step 3 it is still where step 2 left it.
    expect(piecePlacement(folds, 7, 1).x).toBe(0);
    expect(piecePlacement(folds, 7, 3).x).toBe(100);
    // A step that only moves a piece is a step.
    expect(foldSteps(folds)).toEqual([
      { step: 1, faces: [1], moves: [] },
      { step: 2, faces: [], moves: [7] },
    ]);
    expect(nextFoldStep(folds)).toBe(3);
    // Going back to zero at a later step is a move too, and is kept.
    folds = setPiecePlacement(folds, 7, { x: 0 }, 10, 3);
    expect(folds?.pieces?.map((p) => [p.step, p.x])).toEqual([[2, 100], [3, 0]]);
    // Deleting step 2 drops its move; step 3 becomes step 2.
    folds = deleteFoldStep(folds, 2, [a], 10);
    expect(folds?.pieces).toEqual([{ face: 7, x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, step: 2 }]);
    // Dropping a step's placement leaves the piece where it was before then.
    folds = setPiecePlacement(folds, 7, null, 10, 2);
    expect(folds?.pieces).toBeUndefined();
  });

  it("keeps the fold slider at the same moment when steps change", () => {
    const four = [1, 2, 3, 4].map((step) => ({ step, start: (step - 1) * 0.2, end: step * 0.2 }));
    const five = [1, 2, 3, 4, 5].map((step) => ({ step, start: (step - 1) * 0.16, end: step * 0.16 }));
    // The end of step 4 stays the end of step 4.
    expect(keepFoldPlace(0.8, four, five)).toBeCloseTo(0.64);
    // Halfway through step 2 stays halfway through it.
    expect(keepFoldPlace(0.3, four, five)).toBeCloseTo(0.24);
    // Flat and closed stay put.
    expect(keepFoldPlace(0, four, five)).toBe(0);
    expect(keepFoldPlace(1, four, five)).toBe(1);
    // After the last step: the same share of what is left (0.9 is half of 0.8–1).
    expect(keepFoldPlace(0.9, four, five)).toBeCloseTo(0.8 + 0.5 * 0.2);
    // Step 3 removed: halfway through it goes to where step 2 ends.
    const without3 = [1, 2, 4].map((step, k) => ({ step, start: k * 0.25, end: (k + 1) * 0.25 }));
    expect(keepFoldPlace(0.5, four, without3)).toBeCloseTo(0.5);
    expect(keepFoldPlace(0.8, four, without3)).toBeCloseTo(0.75);
  });

  it("agrees on a value only when every panel does", () => {
    expect(common([2, 2, 2])).toBe(2);
    expect(common([2, 3])).toBeUndefined();
  });
});
