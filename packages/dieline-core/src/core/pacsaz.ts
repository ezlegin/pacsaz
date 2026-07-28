import { Anchor } from "./dieline/Anchor";
import { Bleed } from "./dieline/Bleed";
import { Container } from "./dieline/Container";
import Drawer from "./dieline/Dawer";
import { pushModel } from "./helpers/push";
import { Door } from "./models/Door";
import { Dust } from "./models/Dust";
import { Glue } from "./models/Glue";
import { SnapLock } from "./models/SnapLock";
import { PointBuilder } from "./point/PointBuilder";
import { CustomRuler } from "./ruler/CustomRuler";
import { DielineRuler } from "./ruler/DielineRuler";
import { OverallRuler } from "./ruler/OverallRuler";
import { Arc } from "./shapes/Arc";
import { Circle, SemiCircle } from "./shapes/Circle";
import { Line, Lines } from "./shapes/Line";
import { Polygon } from "./shapes/Polygon";
import { Rectangle } from "./shapes/Rectangle";
import { Text } from "./shapes/Text";
import { ToShape } from "./shapes/ToShape";

export default class Pacsaz {
  static shape = {
    push: pushModel,
    ToShape,
  };

  static shapes = {
    Rectangle,
    Line,
    Lines,
    Circle,
    SemiCircle,
    Polygon,
    Text,
    Arc,
  };

  static models = {
    Glue,
    Door,
    Dust,
    SnapLock,
    Drawer,
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
}
