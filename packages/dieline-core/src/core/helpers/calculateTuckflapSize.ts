export function calculateTuckflapSize(
  widthMM: number,
  dustSize: number,
  heightMM: number
) {
  return widthMM <= dustSize * 2 ? heightMM / 2 : dustSize;
}
