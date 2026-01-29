import { pushModel } from "./helpers/add/push";
import { Line } from "./shapes/Line";
import { Rectangle } from "./shapes/rectangle";

export default class Pacsaz {
  static shapes = { Rectangle, Line };
  static shape = {
    push: pushModel,
  };
}
