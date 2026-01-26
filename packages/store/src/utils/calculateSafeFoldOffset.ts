export function calculateSafeFoldOffset(materialThickness: number) {
  if (materialThickness <= 1.5) return materialThickness; // 0 - 1.5

  if (materialThickness < 3) return 1.5; // 1.6 - 2.9

  if (materialThickness < 4) return 2; // 3 - 3.9

  if (materialThickness < 5) return 3.5; // 4 - 4.9

  if (materialThickness < 6) return 4; // 5 - 5.9

  if (materialThickness >= 6) return 5; // 5 - 5.9

  return materialThickness;
}
