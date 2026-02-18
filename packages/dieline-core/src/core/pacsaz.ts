import { Anchor } from "./dieline/Anchor";
import { Bleed } from "./dieline/Bleed";
import { Container } from "./dieline/Container";
import { pushModel } from "./helpers/add/push";
import { Measure } from "./measure/measure";
import { Glue } from "./models/Glue";
import { CustomRuler } from "./ruler/CustomRuler";
import { DielineRuler } from "./ruler/DielineRuler";
import { OverallRuler } from "./ruler/OverallRuler";
import { Circle, SemiCircle } from "./shapes/Circle";
import { Line, Lines } from "./shapes/Line";
import { Polygon } from "./shapes/Polygon";
import { Rectangle } from "./shapes/Rectangle";
import { Text } from "./shapes/Text";
import { PointBuilder } from "./point/PointBuilder";
import { Door } from "./models/Door";
import { Dust } from "./models/Dust";

export default class Pacsaz {
  static shape = {
    push: pushModel,
  };

  static shapes = {
    Rectangle,
    Line,
    Lines,
    Circle,
    SemiCircle,
    Polygon,
    Text,
  };

  static models = {
    Glue,
    Door,
    Dust,
  };

  static point = {
    Builder: PointBuilder,
  };

  static ruler = {
    CustomRuler,
    DielineRuler,
    OverallRuler,
  };

  static layer = {
    Bleed,
    Container,
    Anchor,
  };

  static measure = Measure;
}
