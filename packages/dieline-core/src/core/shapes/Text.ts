import M, { IPoint } from "makerjs";
import Pacsaz from "../Pacsaz";
import { Shape } from "./Shape";

export class Text extends Shape {
  constructor(
    private text: string,
    private position: IPoint,
    private textLayer?: string,
  ) {
    super();
    const textCarrier = new M.models.ConnectTheDots(false, [[0, 0]]);
    const caption = M.model.addCaption(textCarrier, this.text, this.position);

    Pacsaz.shape.push(this, "text", caption, this.textLayer ?? "text");
  }
}
