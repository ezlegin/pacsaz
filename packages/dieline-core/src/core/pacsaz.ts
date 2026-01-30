import { pushModel } from "./helpers/add/push";
import { PointBuilder } from "./helpers/pointBuilder";
import { Circle } from "./shapes/circle";
import { Line, LineChain } from "./shapes/Line";
import { Rectangle } from "./shapes/rectangle";

export default class Pacsaz {
  static shape = {
    push: pushModel,
  };

  static shapes = {
    Rectangle,
    Line,
    LineChain,
    Circle,
  };

  static point = {
    Builder: PointBuilder,
  };
}
