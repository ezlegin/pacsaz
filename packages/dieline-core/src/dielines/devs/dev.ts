import { getDielineSpec } from "@repo/store/dieline/dielineSpec.store";
import { Dieline } from "../../core/dieline/Dieline";
import Pacsaz from "../../core/Pacsaz";
import M, { IModel } from "makerjs";
import { evaluate } from "mathjs";

export class Drawer extends Dieline {
  override slug = "dev";
  override defaultDimensions = {
    width: 90,
    length: 160,
    height: 50,
  };

  protected override trim() {
    const { dielineSpec } = getDielineSpec();

    let lines: IModel = {};
    for (const lineKey in dielineSpec.shapes.line) {
      const lineProps = dielineSpec.shapes.line[lineKey]!;
      const expr = lineProps.length;
      const parsedExpr = evaluate(expr, {
        width: this.width,
        height: this.height,
        length: this.length,
      });
      const line = new Pacsaz.shapes.Line(parsedExpr);
      M.model.addModel(lines, line, "line");
    }

    this.$pushShapes({ lines }, "trimModel");
  }

  protected override widthRuler() {}
  protected override lengthRuler() {}
  protected override heightRuler() {}
}

export default new Drawer();
