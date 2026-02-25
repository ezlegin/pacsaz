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
    height: 0,
  };

  private line() {
    if (!this.shapes.line) return;
    console.log(this.shapes.line);

    for (const [_, { length, angle, origin, layer, hidden }] of Object.entries(
      this.shapes.line,
    )) {
      if (hidden) continue;

      const lineLength = this.$evaluateMathExpr(length);
      const line = new Pacsaz.shapes.Line(lineLength, angle);

      if (origin) {
        const originX = this.$evaluateMathExpr(origin?.x);
        const originY = this.$evaluateMathExpr(origin?.y);
        line.move([originX, originY]);
      }

      this.$pushShapes({ line }, layer === "trim" ? "trimModel" : "foldModel");
    }
  }

  private rectangle() {
    let rects: IModel = {};

    if (!this.shapes.rectangle) return;

    for (const [key, { width, height, hidden }] of Object.entries(
      this.shapes.rectangle,
    )) {
      if (hidden) continue;

      const rectWidth = this.$evaluateMathExpr(width);
      const rectHeight = this.$evaluateMathExpr(height);
      const rect = new Pacsaz.shapes.Rectangle(rectWidth, rectHeight);

      M.model.addModel(rects, rect, key);
    }

    this.$pushShapes({ ...rects.models }, "trimModel");
  }

  protected override trim() {
    console.log("shapes", this.shapes);
    this.line();
    this.rectangle();
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
