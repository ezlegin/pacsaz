import M, { IModel, IPoint } from "makerjs";
import Pacsaz from "../Pacsaz";

export class Text implements IModel {
  models?: MakerJs.IModelMap | undefined;

  constructor(
    private text: string,
    private position: IPoint,
    private textLayer?: string,
  ) {
    const textCarrier = new M.models.ConnectTheDots(false, [[0, 0]]);
    const caption = M.model.addCaption(textCarrier, this.text, this.position);

    Pacsaz.shape.push(this, "text", caption, this.textLayer ?? "text");
  }
}
