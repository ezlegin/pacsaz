import { Dieline } from "../core/dieline/Dieline";
import Pacsaz from "../core/Pacsaz";
import { DielineRuler } from "../core/ruler/DielineRuler";
import { DimensionsType } from "../data/types";

export class PostalCard extends Dieline {
  override slug = `postal-card`;
  override defaultDimensions = {
    width: 130,
    length: 230,
    height: 0,
  };
  override dimensionsType: DimensionsType = ["manufacture"];

  protected override trim() {
    const rect = new Pacsaz.shapes.Rectangle(this.width * 2, this.length);

    this.$pushShapes({ rect }, "trimModel");
  }

  protected override fold() {
    const centerFold = new Pacsaz.shapes.Line(this.length, 90).move([
      this.width,
      0,
    ]);

    this.$pushShapes({ centerFold }, "foldModel");
  }

  protected override lengthRuler(): DielineRuler {
    return new DielineRuler(
      [this.width / 4, 0],
      [this.width / 4, this.length],
      this.length,
      2,
    );
  }
}

export default new PostalCard();
