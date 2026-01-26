export function calculateSafeFoldOffset(thickness: number) {
  if (thickness <= 1.5) return thickness; // 0 - 1.5

  if (thickness < 3) return 1.5; // 1.6 - 2.9

  if (thickness < 4) return 2; // 3 - 3.9

  if (thickness < 5) return 3.5; // 4 - 4.9

  if (thickness < 6) return 4; // 5 - 5.9

  if (thickness >= 6) return 5; // 5 - 5.9

  return thickness;
}
