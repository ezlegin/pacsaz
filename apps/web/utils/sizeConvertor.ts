const PT_PER_INCH = 72;
const MM_PER_INCH = 25.4;

export function toMm(pt: number): number {
  return (pt * MM_PER_INCH) / PT_PER_INCH;
}

export function toPt(mm: number): number {
  return (mm * PT_PER_INCH) / MM_PER_INCH;
}
