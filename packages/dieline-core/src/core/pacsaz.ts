import { pushModel } from "./helpers/add/push";
import { DielineRuler } from "./ruler/DielineRuler";
import { OverallRuler } from "./ruler/OverallRuler";
import { Glue } from "./models/Glue";
import { Circle } from "./shapes/Circle";
import { Line, LineChain } from "./shapes/Line";
import { Polygon } from "./shapes/Polygon";
import { Rectangle } from "./shapes/Rectangle";
import { Text } from "./text/Text";
import { PointBuilder } from "./utils/PointBuilder";

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

  static ruler = {
    DielineRuler,
    OverallRuler,
  };
}
