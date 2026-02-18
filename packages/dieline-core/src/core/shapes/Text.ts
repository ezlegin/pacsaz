import M, { IPoint } from "makerjs";
import Pacsaz from "../Pacsaz";
import { Shape } from "./Shape";

export class Text extends Shape {
  constructor(text: string, position: IPoint, textLayer?: string) {
    super();
    const textCarrier = new M.models.ConnectTheDots(false, [[0, 0]]);
    const caption = M.model.addCaption(textCarrier, text, position);

    Pacsaz.shape.push(this, "text", caption, textLayer ?? "text");
  }
}
