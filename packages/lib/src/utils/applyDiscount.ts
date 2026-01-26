export function applyDiscount(amount: number, discountCode: string) {
  const db = [
    {
      code: "pacsazx",
      amount: 50,
      type: "percent",
      expiresAt: new Date("2026-01-13"),
    },
    {
      code: "pacsaz",
      amount: 10,
      type: "percent",
      expiresAt: new Date("2026-03-17"),
    },
  ];

  const discount = db.find((d) => d.code === discountCode);

  if (!discount) return { error: "Code Not Found" };
  if (discount.expiresAt < new Date()) return { error: "Code is expired" };

  const total =
    discount.type === "fixed"
      ? Math.max(amount - discount.amount, 0)
      : amount * (1 - discount.amount / 100);

  return { total, success: "کد تخفیف با موفقیت اعمال شد." };
}
