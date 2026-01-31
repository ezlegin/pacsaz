import Pacsaz from "../Pacsaz";
import { Shape } from "../shapes/Shape";

export class Glue extends Shape {
  constructor(length: number) {
    super();
    const size = 12;
    const glueMargin = 8;

    const glue = new Pacsaz.shapes.LineChain((pb) =>
      pb
        .draw(-size, glueMargin)
        .up(length - glueMargin * 2)
        .draw(size, glueMargin),
    );

    Pacsaz.shape.push(this, "glue", glue);
  }
}
