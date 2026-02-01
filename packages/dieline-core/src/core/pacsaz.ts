import { pushModel } from "./helpers/add/push";
import { Glue } from "./models/Glue";
import { Circle } from "./shapes/Circle";
import { Line, LineChain } from "./shapes/Line";
import { Polygon } from "./shapes/Polygon";
import { Rectangle } from "./shapes/Rectangle";
import { PointBuilder } from "./utils/PointBuilder";
import { Text } from "./text/Text";

export default class Pacsaz {
  static shape = {
    push: pushModel,
  };

  static shapes = {
    Rectangle,
    Line,
    LineChain,
    Circle,
    Polygon,
    Text,
  };

  static models = {
    Glue,
  };

  static point = {
    Builder: PointBuilder,
  };
}
