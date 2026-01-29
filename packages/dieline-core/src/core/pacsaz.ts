import { pushModel } from "./helpers/add/addModelToLayer";
import { Rectangle } from "./shapes/rectangle";

export default class Pacsaz {
  static shapes = { Rectangle };
  static model = { push: pushModel };
}
