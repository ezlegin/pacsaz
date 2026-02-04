import { IPoint } from "makerjs";

export class PointBuilder {
  private pts: IPoint[] = [];

  constructor(start: IPoint = [0, 0]) {
    this.pts.push([start[0]!, start[1]!]);
  }

  private pointBuilder(dx: number, dy: number) {
    const p = this.pts[this.pts.length - 1];
    this.pts.push([p![0]! + dx, p![1]! + dy]);
    return this;
  }

  draw(x: number, y: number) {
    return this.pointBuilder(x, y);
  }
  down(n: number) {
    return this.pointBuilder(0, -n);
  }
  up(n: number) {
    return this.pointBuilder(0, n);
  }
  right(n: number) {
    return this.pointBuilder(n, 0);
  }
  left(n: number) {
    return this.pointBuilder(-n, 0);
  }

  build() {
    return this.pts;
  }
}
