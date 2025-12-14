import { postalCard } from "./postal-card";

export const dielines = {
  "postal-card": postalCard,
};

export type DielineSlug = keyof typeof dielines;
