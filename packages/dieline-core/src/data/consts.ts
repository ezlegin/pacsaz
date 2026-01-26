import { IPoint } from "makerjs";

export const onDevelepe = process.env.NODE_ENV === "development"; //todo: move to utils package
export const onProduction = process.env.NODE_ENV === "production"; //todo: move to utils package
export const zero: IPoint = [0, 0];
