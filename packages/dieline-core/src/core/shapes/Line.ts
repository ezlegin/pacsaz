import { ISpec } from "@repo/store/types";
import M, { IModel, IPoint } from "makerjs";
import { zero } from "../../data/consts";
import { addFillet, addFilletAt } from "../helpers/addFillet";
import { Shape } from "./Shape";

export class Line extends Shape {
  constructor(length: number, angle?: number) {
    super();

    this.$pushShape("line", this.line(length, angle));
  }

  line(length: number, angle?: number) {
    const arc = new M.paths.Arc(zero, length, 0, angle ?? 0);
    const arcPoints = M.point.fromArc(arc);
    const line = new M.models.ConnectTheDots(false, [zero, arcPoints[1]!]);

    return line;
  }
}

interface LineChainOption {
  closed?: boolean;
  filletRadius?: number;
  indices?: number[];
  effects?: ISpec.ShapeEffect[];
}

export class Lines extends Shape {
  constructor(points: IPoint[], options?: LineChainOption) {
    super();

    let lines: IModel = new M.models.ConnectTheDots(
      options?.closed ?? false,
      points,
    );

    // todo: this probably gets removed in futue. note that remove its types from options.
    if (options?.indices) {
      lines = addFilletAt(lines, options.indices, options.filletRadius);
    } else {
      addFillet(lines, options?.filletRadius);
    }

    // this is used by mirror function to calculate the origin point.
    M.model.originate(lines, points[0]!);

    if (options?.effects) {
      for (const effect of options.effects) {
        switch (effect.type) {
          case "radius":
            const rounded = addFilletAt(
              lines,
              effect.targets.map((t) => +t),
              +effect.value,
            );
            this.$pushShape("lines", rounded);
            return;
        }
      }
    }

    this.$pushShape("lines", lines);
  }
}
