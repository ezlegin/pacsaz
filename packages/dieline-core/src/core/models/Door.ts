import M, { IModel, IModelMap, IPoint } from "makerjs";
import { calcualteTuckFlapSize } from "../../utils/calculate/calculateTuckFlapSize";
import Pacsaz from "../Pacsaz";
import { Model } from "./Model";

type DustSide = "left" | "right" | "both";
type IndentAt = { l: boolean; r: boolean };

export class Door extends Model {
  fingerSpace = this.seamSize.h / 2;
  tuckFlap = {
    indent: this.thickness,
    w: this.width - this.thickness * 2,
    h: calcualteTuckFlapSize(this.width) - this.fingerSpace,
  };
  topPanelHeight = this.height;

  constructor(dustSide?: DustSide, indetAt?: IndentAt) {
    super();

    const dust = this.dust(dustSide, indetAt);

    this.$pushModel(
      "door",
      { ...this.trim(), ...dust.dustTrims },
      { ...this.fold(), ...dust.dustFolds },
    );
  }

  private dust(dustSide?: DustSide, indetAt?: IndentAt) {
    const dustTrims: IModelMap = {};
    const dustFolds: IModelMap = {};

    if (dustSide) {
      const doorSize = M.measure.modelExtents({ models: this.trim() });
      if (!doorSize) throw new Error("Door Size Not Available. [Door]");

      const createAndAssignDust = (
        isLeft: boolean,
        isRight: boolean,
        mirrorX: boolean,
        offsetX: number,
        dustId: "dust1" | "dust2",
      ) => {
        const dust = new Pacsaz.models.Dust(doorSize.height, isLeft, isRight);
        const movedDust = dust.mirror(mirrorX, false).move([offsetX, 0]);

        const dustModel = movedDust.models.dust!;
        dustTrims[dustId] = {
          models: dustModel.models?.trims?.models,
          origin: dustModel.origin,
        };
        dustFolds[dustId] = {
          models: dustModel.models?.folds?.models,
          origin: dustModel.origin,
        };
      };

      if (dustSide === "right") {
        createAndAssignDust(true, true, false, doorSize.width, "dust1");
        createAndAssignDust(
          false,
          true,
          true,
          doorSize.width + this.width + this.height,
          "dust2",
        );
      }

      if (dustSide === "left") {
        createAndAssignDust(true, true, true, -this.height, "dust1");
        createAndAssignDust(
          false,
          true,
          false,
          -this.width - this.height * 2,
          "dust2",
        );
      }

      if (dustSide === "both") {
        const isLeft = indetAt?.l ?? false;
        const isRight = indetAt?.r ?? false;

        createAndAssignDust(true, isLeft, true, -this.height, "dust1");
        createAndAssignDust(true, isRight, false, doorSize.width, "dust2");
      }
    }

    return { dustTrims, dustFolds };
  }

  protected override trim() {
    const pb = new Pacsaz.point.Builder();
    const doorLine = new Pacsaz.shapes.Lines(
      pb
        .up(this.topPanelHeight)
        .right(this.thickness)
        .up(this.tuckFlap.h)
        .right(this.tuckFlap.w)
        .down(this.tuckFlap.h)
        .right(this.thickness)
        .down(this.topPanelHeight)
        .build(),
      { filletRadius: 20 },
    );

    const seam = this.seam();

    return { doorLine, seam };
  }

  private seam(): IModel {
    const seam_pb = new Pacsaz.point.Builder([
      this.tuckFlap.indent,
      this.topPanelHeight,
    ]);
    const seam = new Pacsaz.shapes.Lines(
      seam_pb.right(this.seamSize.w).down(this.seamSize.h).build(),
      {
        filletRadius: 2,
      },
    )
      .dup()
      .mirror(true, false, "left")
      .move([this.tuckFlap.w, 0]);

    return seam;
  }

  protected override fold() {
    const Y = this.topPanelHeight - this.fingerSpace;
    const temp = new M.paths.Line([
      [0, Y],
      [this.width, Y],
    ]);

    const seamChain = M.model.findChains(this.seam()) as M.IChain[];
    let intersectionPoints: IPoint[] = [];
    for (const chain of seamChain) {
      const newModel = M.chain.toNewModel(chain);

      for (const pathId in newModel.paths) {
        const path = newModel.paths[pathId]!;
        const ints = M.path.intersection(temp, path);
        if (ints) {
          const intPoint = ints.intersectionPoints[0]!;
          intersectionPoints.push(intPoint);
        }
      }
    }

    const tuckEndFold = new Pacsaz.shapes.Lines(intersectionPoints);

    const doorFold = new Pacsaz.shapes.Line(this.width);

    return { doorFold, tuckEndFold };
  }

  get seamSize() {
    return {
      w: 8,
      h: this.thickness * 2,
    };
  }
}
