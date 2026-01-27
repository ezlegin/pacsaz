export const categories = [
  {
    groupLabel: "بر اساس استفاده",
    key: "usage",
    categories: [
      { id: 1, label: "خوراک", slug: "food" },
      { id: 1, label: "خوراکی", slug: "food" },
      { id: 2, label: "اسباب بازی", slug: "toys" },
      { id: 3, label: "کافه", slug: "coffee" },
    ],
  },
  {
    groupLabel: "بر اساس قالب",
    key: "model",
    categories: [
      { id: 1, label: "Tuck End", slug: "tuck-end" },
      { id: 2, label: "FEFCO", slug: "fefco" },
      { id: 3, label: "Folding", slug: "folding" },
      { id: 4, label: "Window", slug: "window" },
      { id: 5, label: "Tuck End 2", slug: "tuck-end" },
    ],
  },
];

export function searchCategories(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const flattedCats = categories.flatMap((c) => c.categories);

  return flattedCats.filter((cat) => cat.label.toLowerCase().includes(q));
}
