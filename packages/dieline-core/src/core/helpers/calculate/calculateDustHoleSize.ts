export function calculateDustHoleSize(safeFoldOffset: number) {
  const addLineToHole = safeFoldOffset < 2;
  const endAngleThreshold = safeFoldOffset < 1;
  const endAngle = addLineToHole ? (endAngleThreshold ? -30 : -15) : 0;
  return {
    addLineToHole,
    endAngle,
    holeRadius: (safeFoldOffset * 3) / 2, // to /2 BECUASE IT IS RADUIS
  };
}
