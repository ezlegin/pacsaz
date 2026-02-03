import { Anchor } from "./dieline/Anchor";
import { Bleed } from "./dieline/Bleed";
import { Container } from "./dieline/Container";
import { pushModel } from "./helpers/add/push";
import { Glue } from "./models/Glue";
import { DielineRuler } from "./ruler/DielineRuler";
import { OverallRuler } from "./ruler/OverallRuler";
import { Circle } from "./shapes/Circle";
import { Line, LineChain } from "./shapes/Line";
import { Polygon } from "./shapes/Polygon";
import { Rectangle } from "./shapes/Rectangle";
import { Text } from "./shapes/Text";
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

  static layer = {
    Bleed,
    Container,
    Anchor,
  };
}
