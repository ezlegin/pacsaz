import { getDielineSpec } from "@repo/store/dieline/dielineSpec.store";
import M, { IModel } from "makerjs";
import { evaluate } from "mathjs";
import Pacsaz from "../Pacsaz";
import { Dieline } from "./Dieline";

export class Drawer extends Dieline {
  private get shapes() {
    return getDielineSpec().dielineSpec.shapes;
  }
  override defaultDimensions = {
    width: 90,
    length: 160,
    height: 50,
  };

  private line() {
    let lines: IModel = {};

    if (!this.shapes.line) return;

    for (const [_, { length, angle, origin }] of Object.entries(
      this.shapes.line,
    )) {
      const lineLength = this.$evaluateMathExpr(length);
      const line = new Pacsaz.shapes.Line(lineLength);

      if (angle) line.rotate(angle);
      if (origin) line.move([+origin.x, +origin.y]);

      M.model.addModel(lines, line, "line");
    }

    this.$pushShapes({ ...lines.models }, "trimModel");
  }

  protected override trim() {
    this.line();
  }

  // -------------------- UTILS --------------------

  private $evaluateMathExpr(expr: string): number {
    const scope = {
      width: this.width,
      height: this.height,
      length: this.length,
    };

    return evaluate(expr, scope);
  }
}

export default new Drawer();
