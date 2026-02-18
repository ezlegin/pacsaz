import { IModelMap } from "makerjs";
import Pacsaz from "../Pacsaz";
import { Model } from "./Model";

export class Glue extends Model {
  constructor() {
    super();

    this.$pushModel("glue", this.trim());
  }

  protected override trim(): IModelMap {
    const margin = 8;

    const pb = new Pacsaz.point.Builder();
    const pts = pb
      .draw(-this.glueSize, margin)
      .up(this.length - margin * 2)
      .draw(this.glueSize, margin)
      .up(this.safeFoldOffset)
      .build();

    const glue = new Pacsaz.shapes.Lines(pts);

    return { glue };
  }

  private get glueSize() {
    const glueSizes = {
      sm: 12,
      md: 16,
      lg: 25,
      xl: 35,
      xxl: 50,
    };

    const total = this.width + this.height;

    let glueSize: number;

    switch (true) {
      case total < 140:
        glueSize = glueSizes.sm;
        break;
      case total < 250:
        glueSize = glueSizes.md;
        break;
      case total < 350:
        glueSize = glueSizes.lg;
        break;
      case total < 450:
        glueSize = glueSizes.xl;
        break;
      default:
        glueSize = glueSizes.xxl;
        break;
    }

    const threshold = this.height * 0.2; // 20% of height
    if (glueSize >= this.height - threshold) {
      glueSize = this.height / 2.5;
    }

    return glueSize;
  }
}
