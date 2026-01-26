export function calculateFairDownload({ monthly }: { monthly: number }) {
  return {
    monthly,
    threeMonth: monthly * 3,
    annual: monthly * 12,
  };
}
