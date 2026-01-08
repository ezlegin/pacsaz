import { toPt } from "../../utils/sizeConvertor";

export const isPackagingSizeLogical = (height: number, width: number) => {
  return height - toPt(6) <= width;
};
