import M, { IPoint } from "makerjs";
import { Shape } from "./Shape";

export class Text extends Shape {
  constructor(text: string, position: IPoint, textLayer?: string) {
    super();
    const textCarrier = new M.models.ConnectTheDots(false, [[0, 0]]);
    const caption = M.model.addCaption(textCarrier, text, position);

    this.$pushShape("text", caption, textLayer ?? "text");
  }
}
