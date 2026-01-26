export function mapDustSize(width: number, dustSize: number, height: number) {
  return width <= dustSize * 2 ? height / 2 : dustSize;
}
