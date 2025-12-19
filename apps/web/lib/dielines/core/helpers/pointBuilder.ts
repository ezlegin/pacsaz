import { toPt } from "@/utils/sizeConvertor";
import { IPoint } from "makerjs";

export class PointBuilder {
  private pts: IPoint[] = [];

  constructor(start: IPoint = [0, 0]) {
    this.pts.push([toPt(start[0]!), toPt(start[1]!)]);
  }

  // relative move
  pointBuilder(dx: number, dy: number) {
    const p = this.pts[this.pts.length - 1];
    this.pts.push([p![0]! + dx, p![1]! + dy]);
    return this;
  }

  // alias for readability
  draw(x: number, y: number) {
    return this.pointBuilder(toPt(x), toPt(y));
  }
  down(n: number) {
    return this.pointBuilder(0, toPt(-n));
  }
  up(n: number) {
    return this.pointBuilder(0, toPt(n));
  }
  right(n: number) {
    return this.pointBuilder(toPt(n), 0);
  }
  left(n: number) {
    return this.pointBuilder(toPt(-n), 0);
  }

  build() {
    return this.pts;
  }
}
