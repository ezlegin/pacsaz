export function calcualteTuckFlapSize(width: number) {
  if (width >= 180) return 25; // > 180
  if (width >= 130) return 20; // 130 - 179
  if (width >= 100) return 15; // 100 - 129
  if (width >= 60) return 13; // 60 - 99
  return 11; // < 60
}
